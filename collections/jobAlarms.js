import Papa from 'papaparse';


JobAlarms = new Mongo.Collection('jobAlarms');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  JobAlarms._ensureIndex({ status: 1 });
  JobAlarms._ensureIndex({ jobId: 1, runId: 1 });
});


Meteor.methods({
  acknowledgeAlarm: function(alarmId) {
    if (!Meteor.isServer) return;

    var alarm = JobAlarms.findOne(alarmId);
    var job = Jobs.findOne(alarm.jobId);
    requireOwnership(this.userId, job);

    JobAlarms.update(alarmId, { $set: { status: 'ack' } })
  },

  commentAlarm: function(alarmId, content) {
    if (!Meteor.isServer) return;

    var alarm = JobAlarms.findOne(alarmId);
    var job = Jobs.findOne(alarm.jobId);
    requireAccess(this.userId, job);

    var comment = {
      authorId: this.userId,
      author: Meteor.users.findOne(this.userId).displayName,
      insertedAt: new Date(),
      content: content
    };

    JobAlarms.update(alarmId, {
      $push: {comments: comment}
    });
  },

  deleteAlarmComment: function(alarmId, ts) {
    JobAlarms.update(alarmId, {
      $pull: { comments: { authorId: this.userId, insertedAt: ts } }
    });
  }
});


checkJobForAlarms = function(job, result) {
  var matches = [];
  var runId = Random.id();
  if (result.status !== 'ok') return matches;

  _.each(job.rules || [], (rule) => {
    _.each(result.data, (row) => {
      var isMatch = _.every(rule.conditions, (condition) => {
        var field = row[condition.field];
        var value = condition.value;
        var op = condition.op;

        if (!op) return;

        if (value.indexOf('@') ===0) {
          var key = value.substring(1, value.length);
          value = row[key];
        }

        if (OPERATORS.hasOwnProperty(op))
          return OPERATORS[op].fn(field, value);  
        else
          throw new Meteor.Error('rule-error', `Unrecognized rule operator "${op}"`);
      });

      if (isMatch) {
        var alarm = {
          jobId      : job._id,
          runId      : runId,
          insertedAt : new Date(),
          status     : 'open',
          row        : row,
          rule       : rule,
        };

        JobAlarms.insert(alarm);
        matches.push(alarm);
      }
    });
  });

  if (job.alarm && matches.length > 0) {
    var worstStatus = _.chain(matches)
      .map((alarm) => alarm.rule.severity)
      .sortBy((level) => SEVERITIES[level].rank)
      .first().value();
    var worstStatusRank = SEVERITIES[worstStatus].rank;
    var jobUrl = Meteor.absoluteUrl(`jobs/${job._id}/edit`);
    var alarmsUrl = Meteor.absoluteUrl(`alarms/${job._id}/${runId}`);

    Jobs.update(job._id, { $set: { alarmStatus: worstStatus } });

    if (job.alarm.email) {
      var alarmLevel = job.alarm.emailSeverity || 'info';
      var alarmLevelRank = SEVERITIES[alarmLevel].rank;

      if (alarmLevelRank >= worstStatusRank) {
        Email.send({
          from    : 'noreply@heimdall',
          to      : job.alarm.email,
          subject : `[heimdall] [${worstStatus}] ${job.name}`,
          html    : `Job <a href="${jobUrl}">${job.name}</a> triggered <b>${worstStatus}</b>, <a href="${alarmsUrl}">check it out</a>.`,
          attachments: [
            {
              fileName    : 'results.csv',
              contentType : 'text/csv',
              contents    : Papa.unparse(result.data, { delimiter: ',' })
            }
          ]
        });
      }
    }

    if (job.alarm.slack) {
      var alarmLevel = job.alarm.slackSeverity || 'info';
      var alarmLevelRank = SEVERITIES[alarmLevel].rank;

      if (alarmLevelRank >= worstStatusRank) {
        _.each(job.alarm.slack, (channel) => {
          sendSlack({
            username: 'heimdall',
            channel: channel,
            text: `Job <${jobUrl}|${job.name}> triggered *${worstStatus}*, <${alarmsUrl}|check it out>`,
            attachments: _.chain(matches)
              .groupBy((alarm) => alarm.rule.name)
              .map((group, ruleName) => {
                var ruleName = ruleName;
                var ruleSeverity = group[0].rule.severity;

                return {
                  color: SEVERITIES[ruleSeverity].hexColor,
                  text: `${ruleName} (${group.length}x)`
                };
              }).value()
          });
        });
      }
    }
  }

  return matches;
};