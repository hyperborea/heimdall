import Papa from "papaparse";
import { mapValues } from "lodash";
import { requiredIf } from "./_commonSchema";

Jobs = new Mongo.Collection("jobs");

Jobs.schema = new SimpleSchema({
  name: String,
  sourceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  query: String,
  parameters: { type: Object, blackbox: true },
  status: String,
  createdAt: {
    type: Date,
    index: -1,
    autoValue: function () {
      if (this.isInsert) return new Date();
      else this.unset();
    },
  },
  cacheDuration: { type: SimpleSchema.Integer },
  schedule: { type: String, optional: true },
  scheduleError: { type: String, optional: true },
  email: Object,
  "email.enabled": Boolean,
  "email.recipients": {
    type: String,
    optional: true,
    custom: requiredIf("email.enabled", true),
  },
  "email.subject": {
    type: String,
    optional: true,
    custom: requiredIf("email.enabled", true),
  },
  "email.content": {
    type: String,
    optional: true,
    custom: requiredIf("email.enabled", true),
  },
  rules: Array,
  "rules.$": Object,
  "rules.$.name": { type: String, label: "Alarm name" },
  "rules.$.severity": { type: String, label: "Alarm severity" },
  "rules.$.conditions": Array,
  "rules.$.conditions.$": Object,
  "rules.$.conditions.$.field": { type: String, label: "Alarm field" },
  "rules.$.conditions.$.op": { type: String, label: "Alarm operator" },
  "rules.$.conditions.$.value": { type: String, label: "Alarm value" },
  alarmStatus: { type: String, optional: true },
  alarm: { type: Object, optional: true },
  "alarm.email": { type: String, optional: true },
  "alarm.emailSeverity": { type: String, optional: true },
  "alarm.slack": { type: Array, optional: true },
  "alarm.slack.$": String,
  "alarm.slackSeverity": { type: String, optional: true },
  transpose: Object,
  "transpose.enabled": Boolean,
  "transpose.keyField": {
    type: String,
    optional: true,
    custom: requiredIf("transpose.enabled", true),
    label: "Key field",
  },
  "transpose.catField": {
    type: String,
    optional: true,
    custom: requiredIf("transpose.enabled", true),
    label: "Category field",
  },
  "transpose.valField": {
    type: String,
    optional: true,
    custom: requiredIf("transpose.enabled", true),
    label: "Value field",
  },
});

Jobs.schema.extend(permissionSchema);
Jobs.attachSchema(Jobs.schema);

Jobs.helpers({
  result: function (parameters) {
    parameters = cleanParameters(parameters, this.parameters);
    return JobResults.findOne({ jobId: this._id, parameters: parameters });
  },

  visualizations: function () {
    return Visualizations.find(
      {
        jobId: this._id,
      },
      {
        sort: { title: 1 },
      }
    );
  },

  isRunning: function () {
    return this.status === "running";
  },
});

Meteor.methods({
  saveJob: function (job) {
    const user = Meteor.users.findOne(this.userId);

    var jobId = job._id;
    var oldDoc = {};
    var doc = _.omit(job, "_id", "owner", "ownerId");
    _.defaults(doc, {
      parameters: {},
      rules: [],
      scheduleError: null,
    });

    doc.parameters = _.chain(getQueryParameters(doc.query))
      .map((key) => [key, doc.parameters[key] || ""])
      .object()
      .value();

    if (!jobId) {
      requireUser(this.userId);
      doc.ownerId = this.userId;
      doc.owner = user.username;
      doc.status = "new";
      jobId = Jobs.insert(doc);
    } else {
      oldDoc = Jobs.findOne(jobId);
      requireOwnership(user, oldDoc);

      Jobs.update(jobId, { $set: doc });
      Visualizations.find({ jobId: jobId }).forEach((vis) =>
        syncVisualization(vis._id, doc)
      );

      // if the query has changed in any way invalidate aggressively all caches
      if (doc.query !== oldDoc.query) {
        JobResults.remove({ jobId: jobId });
      }

      // update job result expiration dates if the cache duration has changed
      if (doc.cacheDuration !== oldDoc.cacheDuration) {
        JobResults.find({ jobId: jobId }).forEach((res) => {
          var expiresAt = moment(res.updatedAt)
            .add(doc.cacheDuration, "seconds")
            .toDate();
          JobResults.update(res._id, { $set: { expiresAt: expiresAt } });
        });
      }
    }

    // Recreate cron if the schedule has changed.
    if (Meteor.isServer && doc.schedule != oldDoc.schedule) {
      scheduleJob(jobId, doc.schedule);
    }

    return jobId;
  },

  cloneJob: function (jobId) {
    var job = Jobs.findOne(jobId);
    requireOwnership(this.userId, job);

    delete job._id;
    job.name = job.name + " - CLONE";
    return Jobs.insert(job);
  },

  removeJob: function (jobId) {
    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId));

    if (Meteor.isServer) {
      SyncedCron.remove(jobId);
    }

    Jobs.remove(jobId);
    JobResults.remove({ jobId: jobId });
    Visualizations.remove({ jobId: jobId });
  },

  runJob: function (jobId, parameters) {
    if (!Meteor.isServer) return;

    check(jobId, String);
    requireOwnership(this.userId, Jobs.findOne(jobId));

    runJob(jobId, parameters);
  },

  cancelJob: function (jobId) {
    if (!Meteor.isServer) return;

    var job = Jobs.findOne(jobId);
    var source = Sources.findOne(job.sourceId);
    requireOwnership(this.userId, job);

    source.cancel(job.result().pid);
  },
});

scheduleJob = function (jobId, scheduleString) {
  SyncedCron.remove(jobId);

  if (scheduleString) {
    SyncedCron.add({
      name: jobId,
      job: () => runJob(jobId),
      schedule: function (parser) {
        var schedule = parser.text(scheduleString);

        if (schedule.error !== -1) {
          var stringBeforeError = scheduleString.substring(0, schedule.error);
          var stringAfterError = scheduleString.substring(
            schedule.error,
            scheduleString.length
          );
          var errorMessage = `syntax error: "${stringBeforeError}[=>]${stringAfterError}"`;

          Jobs.update(jobId, { $set: { scheduleError: errorMessage } });
          return parser.recur();
        } else {
          return schedule;
        }
      },
    });
  }
};

runJob = function (jobId, parameters) {
  const startedAt = new Date();
  const runId = Random.id();
  const job = Jobs.findOne(jobId);
  const source = Sources.findOne(job.sourceId);

  parameters = parameters || {};
  parameters = cleanParameters(parameters, job.parameters);

  if (source) {
    requireAccess(job.ownerId, source);
  } else {
    console.warn(`Job ${jobId} does no longer have a valid source`);
    return;
  }

  function updateJob(result, firstUpdate = false) {
    // the job might have been rerun in a different thread by now, don't update in that case
    if (!firstUpdate && job.result(parameters).runId !== runId) {
      console.log(
        `Job ${jobId}: disconnected, ${
          job.result(parameters).runId
        } != ${runId}`
      );
      return;
    }

    // only update job status if parameteres are the job defaults
    if (_.isEqual(parameters, job.parameters)) {
      Jobs.update(jobId, { $set: { status: result.status } });
    }

    result.runId = runId;
    result.expiresAt = moment().add(job.cacheDuration, "seconds").toDate();
    JobResults.upsert(
      { jobId: jobId, parameters: parameters },
      { $set: result }
    );
  }

  updateJob({ status: "running" }, true);

  // make sure there are no rogue queries hanging in the background
  var result = job.result(parameters);
  if (
    result &&
    result.pid &&
    ["running", "zombie"].indexOf(result.status) !== -1
  ) {
    console.log(`Job ${jobId}: cancel pid ${result.pid}`);
    source.cancel(result.pid);
  }

  source.query(
    job.query,
    parameters,
    function (result) {
      if (result.status === "ok" && result.data) {
        // enforce maximum rows setting (bson size is limited to ~ 16MB)
        if (result.data.length > SOURCE_SETTINGS.maxRows) {
          result = {
            status: "error",
            data: `Exceeded limit of ${SOURCE_SETTINGS.maxRows} rows.`,
          };
        }

        // transpose data if configured to do so
        else if (job.transpose.enabled) {
          var store = {},
            fields = new Set([job.transpose.keyField]);

          result.data.forEach((row) => {
            var key = row[job.transpose.keyField],
              cat = row[job.transpose.catField],
              val = row[job.transpose.valField],
              obj = {};

            if (store.hasOwnProperty(key)) {
              obj = store[key];
            } else {
              store[key] = obj;
              obj[job.transpose.keyField] = key;
            }

            obj[cat] = val;
            fields.add(cat);
          });

          result.data = _.values(store);
          result.fields = Array.from(fields);
        }
      }

      // sanitize data, keys are not allowed to contain dots
      _.isObject(result.data) &&
        _.each(result.data, (row) => {
          _.each(row, (value, key) => {
            if (_.isObject(value) && !(value instanceof Date)) {
              var json = JSON.stringify(value);
              row[key] =
                json.length > 100 ? json.substring(0, 100) + "..." : json;
            }

            if (key.indexOf(".") !== -1) {
              row[key.replace(".", "_")] = value;
              delete row[key];
            }
          });
        });

      result.pid = null;
      updateJob(result);
      checkJobForAlarms(job, result, runId);
      logJobHistory(job, result, startedAt, new Date());

      if (job.email.enabled) {
        if (result.status === "ok") {
          let html = job.email.content.replace(/(?:\r\n|\r|\n)/g, "<br />");

          Email.send({
            from: "noreply@heimdall",
            to: job.email.recipients,
            subject: job.email.subject,
            html: html,
            attachments: [
              {
                fileName: "results.csv",
                contentType: "text/csv",
                contents: Papa.unparse(
                  { fields: result.fields, data: result.data },
                  { delimiter: "," }
                ),
              },
            ],
          });
        } else if (result.status === "error") {
          Email.send({
            from: "noreply@heimdall",
            to: job.email.recipients,
            subject: `[heimdall] error in job "${job.name}"`,
            text: result.data,
          });
        }
      }
    },
    function (pid) {
      updateJob({
        status: "running",
        pid: pid,
      });
    }
  );
};

// Parses out parameteres (in double curly braces) from a string and returns a list of the parameter names.
getQueryParameters = function (query) {
  var matches = query.match(/{{\s*\w+\s*}}/g);
  if (matches) {
    return matches.map((s) => s.substring(2, s.length - 2).trim());
  } else return [];
};

replaceQueryParameters = function (query, replacement) {
  return query.replace(/{{\s*(\w+)\s*}}/g, replacement);
};

// Make sure only relevant parameters are used and that defaults are still filled in.
cleanParameters = function (params, defaultParams) {
  params = params || {};
  return mapValues(defaultParams, (v, k) => params[k] || v);
};
