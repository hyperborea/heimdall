Jobs = new Mongo.Collection('jobs');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  Jobs._ensureIndex({ createdAt: -1 });
});


Jobs.helpers({
  result: function() {
    return JobResults.findOne({ jobId: this._id }) || {};
  },

  visualizations: function() {
    return Visualizations.find({
      jobId: this._id
    }, {
      sort: { title: 1 }
    });
  },

  isRunning: function() {
    return this.status === 'running'
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
      Jobs.update(jobId, { $set: doc });
      Visualizations.find({ jobId: jobId }).forEach((vis) => syncVisualization(vis._id, doc));
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

    const pid = job.result().pid;
    if (job.status === 'running' && pid) {
      source.query(`select pg_terminate_backend(${pid})`);
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
    result.jobId = jobId;
    JobResults.upsert({jobId: jobId}, {$set: result})
    Jobs.update(jobId, {$set: {status: result.status}});
  }

  updateJob({status: 'running'});

  source.query(job.query, function(result) {
    // enforce maximum rows setting (bson size is limited to ~ 16MB)
    if (result.status === 'ok' && result.data && result.data.length > SOURCE_SETTINGS.maxRows)
      result = { status: 'error', data: `Exceeded limit of ${SOURCE_SETTINGS.maxRows} rows.` };

    // sanitize data, keys are not allowed to contain dots
    _.isObject(result.data) && _.each(result.data, (row) => {
      _.each(row, (value, key) => {
        if (_.isObject(value) && !(value instanceof Date)) {
          var json = JSON.stringify(value);
          row[key] = (json.length > 100) ? (json.substring(0, 100) + '...') : json;
        }

        if (_.contains(key, '.')) {
          row[key.replace('.', '_')] = value;
          delete row[key];
        }
      });
    });

    updateJob(result);
    checkJobForAlarms(job, result);
    logJobHistory(job, result, startedAt, new Date());

    // TODO: send error email on failure
    if (job.email.enabled) {
      Email.send({
        from    : 'noreply@heimdall',
        to      : job.email.recipients,
        subject : job.email.subject,
        text    : job.email.content,
        attachments: [
          {
            fileName    : 'results.csv',
            contentType : 'text/csv',
            contents    : Papa.unparse(result.data, { delimiter: ',' })
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