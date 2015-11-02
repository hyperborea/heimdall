Jobs = new Mongo.Collection('jobs');

Meteor.methods({
  saveJob: function(job) {
    const user = Meteor.users.findOne(this.userId);

    var jobId = job._id;
    var doc = _.omit(dotNotationToObject(job), '_id', 'owner', 'ownerId', 'createdAt');
    var oldDoc = {};

    if (!jobId) {
      doc.createdAt = Date.now();
      doc.ownerId = this.userId;
      doc.owner = user.username;

      jobId = Jobs.insert(doc);
    }
    else {
      oldDoc = Jobs.findOne(jobId);
      requireOwnership(this.userId, oldDoc.ownerId);
      Jobs.update(jobId, {$set: doc});
    }

    // Recreate cron if the schedule has changed.
    if (Meteor.isServer && doc.schedule != oldDoc.schedule) {
      scheduleJob(jobId, doc.schedule);
    }

    return jobId;
  },


  removeJob: function(jobId) {
    requireOwnership(this.userId, jobId);

    if (Meteor.isServer) {
      SyncedCron.remove(jobId);
    }
    Jobs.remove(jobId);
  },


  runJob: function(jobId) {
    if (!Meteor.isServer) return;

    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId).ownerId);

    runJob(jobId);
  },


  cancelJob: function(jobId) {
    if (!Meteor.isServer) return;

    var job = Jobs.findOne(jobId);
    var source = Sources.findOne(job.sourceId);
    requireOwnership(this.userId, job.ownerId);

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
  var job = Jobs.findOne(jobId);
  var source = Sources.findOne(job.sourceId);

  source.isPublic || requireOwnership(job.ownerId, source.ownerId);

  function updateResult(result) {
    result.jobId = jobId;
    result.updatedAt = Date.now();
    Jobs.update(jobId, {$set: {result: result}});
  }

  updateResult({ status: 'running' });

  queryPostgres(source, job.query, function(result) {
    _.each(result.data, (row, i) => {
      _.each(row, (value, key) => {
        if (key.indexOf('.') !== -1) {
          delete result.data[i][key];
          result.data[i][key.replace('.', '_')] = value;
        }
      });
    });
    updateResult(result);

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