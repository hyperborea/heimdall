Jobs = new Mongo.Collection('jobs');

Meteor.methods({
  saveJob: function(job) {
    const user = Meteor.users.findOne(this.userId);

    var jobId = job._id;
    var oldDoc = {};
    var doc = _.omit(job, '_id', 'owner', 'ownerId', 'createdAt');
    _.defaults(doc, {
      rules: []
    });

    if (!jobId) {
      requireUser(this.userId);
      
      doc.createdAt = new Date();
      doc.ownerId = this.userId;
      doc.owner = user.username;

      jobId = Jobs.insert(doc);
    }
    else {
      oldDoc = Jobs.findOne(jobId);
      requireOwnership(user, oldDoc);
      Jobs.update(jobId, {$set: doc});
    }

    // Recreate cron if the schedule has changed.
    if (Meteor.isServer && doc.schedule != oldDoc.schedule) {
      scheduleJob(jobId, doc.schedule);
    }

    return jobId;
  },


  saveJobVis: function(jobId, settings) {
    var job = Jobs.findOne(jobId);
    requireOwnership(this.userId, job);

    Jobs.update(jobId, {$set: {vis: settings}});
  },


  removeJob: function(jobId) {
    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId));

    if (Meteor.isServer) {
      SyncedCron.remove(jobId);
    }
    Jobs.remove(jobId);
  },


  runJob: function(jobId) {
    if (!Meteor.isServer) return;

    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId));

    runJob(jobId);
  },


  checkJob: function(jobId) {
    check(jobId, String);
    const job = Jobs.findOne(jobId);
    const rules = job.rules || [];

    requireOwnership(this.userId, job);
    if (job.result.status !== 'ok') return;

    _.each(rules, (rule) => {
      _.each(job.result.data, (row) => {
        var isMatch = _.every(rule.conditions, (condition) => {
          var field = row[condition.field];
          var value = condition.value;

          switch(condition.op) {
            case 'eq': return field == value;
            case 'ne': return field != value;
            case 'gt': return field > value;
            case 'lt': return field < value;
            default:
              throw new Meteor.Error('rule-error', `Unrecognized rule operator "${condition.op}"`);
          }
        });

        if (isMatch) {
          console.log(row, rule);
        }
      });
    });
  },


  cancelJob: function(jobId) {
    if (!Meteor.isServer) return;

    var job = Jobs.findOne(jobId);
    var source = Sources.findOne(job.sourceId);
    requireOwnership(this.userId, job);

    const pid = job.result.pid;
    if (job.result.status === 'running' && pid) {
      queryPostgres(source, `select pg_terminate_backend(${pid})`);
    }
  }
});


scheduleJob = function(jobId, schedule) {
  SyncedCron.remove(jobId);

  if (schedule) {
    SyncedCron.add({
      name     : jobId,
      schedule : (parser) => parser.text(schedule),
      job      : () => runJob(jobId)
    });
  }
};


runJob = function(jobId) {
  var startedAt = new Date();
  var job = Jobs.findOne(jobId);
  var source = Sources.findOne(job.sourceId);

  requireAccess(job.ownerId, source);

  function updateResult(result) {
    result = _.extend(job.result || {}, result, {
      jobId     : jobId,
      updatedAt : new Date()
    })
    Jobs.update(jobId, {$set: {result: result, status: result.status}});
  }

  updateResult({ status: 'running' });

  queryPostgres(source, job.query, function(result) {
    // TODO: need to sanitize data better (and recursively), keys cannot contain dots (.)
    updateResult(result);
    logJobHistory(job, result, startedAt, new Date());

    if (job.email.enabled) {
      Email.send({
        from    : 'noreply@heimdall.klarna.com',
        to      : job.email.recipients,
        subject : job.email.subject,
        text    : job.email.content,
        attachments: [
          {
            fileName    : 'results.csv',
            contentType : 'text/csv',
            contents    : Papa.unparse(result.data, { delimiter: ';' })
          }
        ]
      });
    }
  }, function(pid) {
    updateResult({
      status: 'running',
      pid: pid
    });
  });
};