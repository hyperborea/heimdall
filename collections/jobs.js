Jobs = new Mongo.Collection('jobs');


Jobs.helpers({
  visualizations: function() {
    return Visualizations.find({
      jobId: this._id
    }, {
      sort: { title: 1 }
    });
  },

  isRunning: function() {
    return this.result && this.result.status === 'running'
  }
});


Meteor.methods({
  saveJob: function(job) {
    const user = Meteor.users.findOne(this.userId);

    var jobId = job._id;
    var oldDoc = {};
    var doc = _.omit(job, '_id', 'owner', 'ownerId', 'createdAt');
    _.defaults(doc, {
      rules: [],
      scheduleError: false
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

  removeJob: function(jobId) {
    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId));

    if (Meteor.isServer) {
      SyncedCron.remove(jobId);
    }

    Jobs.remove(jobId);
    Visualizations.remove({ jobId: jobId });
  },


  runJob: function(jobId) {
    if (!Meteor.isServer) return;

    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId));

    runJob(jobId);
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


scheduleJob = function(jobId, scheduleString) {
  SyncedCron.remove(jobId);

  if (scheduleString) {
    SyncedCron.add({
      name: jobId,
      job: () => runJob(jobId),
      schedule: function(parser) {
        var schedule = parser.text(scheduleString);

        if (schedule.error !== -1) {
          var stringBeforeError = scheduleString.substring(0, schedule.error);
          var stringAfterError = scheduleString.substring(schedule.error, scheduleString.length);
          var errorMessage = `syntax error: "${stringBeforeError}[=>]${stringAfterError}"`;

          Jobs.update(jobId, {$set: { scheduleError: errorMessage }});
          return parser.recur();
        }
        else {
          return schedule;
        }
      }
    });
  }
};


runJob = function(jobId) {
  var startedAt = new Date();
  var job = Jobs.findOne(jobId);
  var source = Sources.findOne(job.sourceId);

  requireAccess(job.ownerId, source);

  function updateJob(result) {
    job.status = result.status;
    job.result = _.extend(job.result || {}, result, {
      jobId     : jobId,
      updatedAt : new Date()
    });

    Jobs.update(jobId, {$set: {result: job.result, status: job.status}});
  }

  updateJob({ status: 'running' });

  queryPostgres(source, job.query, function(result) {
    // TODO: need to sanitize data better (and recursively), keys cannot contain dots (.)
    updateJob(result);
    checkJobForAlarms(job);
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
    updateJob({
      status: 'running',
      pid: pid
    });
  });
};