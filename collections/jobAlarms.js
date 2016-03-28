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


checkJobForAlarms = function(job) {
  var matches = [];
  var runId = Random.id();
  if (!job.result || job.result.status !== 'ok') return matches;

  _.each(job.rules || [], (rule) => {
    _.each(job.result.data, (row) => {
      var isMatch = _.every(rule.conditions, (condition) => {
        var field = row[condition.field];
        var value = condition.value;
        var op = condition.op;

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

  var worstStatus = _.chain(matches)
    .map((alarm) => alarm.rule.severity)
    .sortBy((level) => SEVERITIES[level].rank)
    .first().value();
  var worstStatusRank = SEVERITIES[worstStatus].rank;

  Jobs.update(job._id, { $set: { alarmStatus: worstStatus } });

  if (job.alarm && matches.length > 0) {
    var jobUrl = Meteor.absoluteUrl(`jobs/${job._id}/edit`);
    var alarmsUrl = Meteor.absoluteUrl(`alarms/${job._id}/${runId}`);

    if (job.alarm.email) {
      var alarmLevel = job.alarm.emailSeverity || 'info';
      var alarmLevelRank = SEVERITIES[alarmLevel].rank;

      if (alarmLevelRank >= worstStatusRank) {
        Email.send({
          from    : 'noreply@heimdall.klarna.com',
          to      : job.alarm.email,
          subject : `[heimdall] [${worstStatus}] ${job.name}`,
          text    : 'some content coming here',
          attachments: [
            {
              fileName    : 'results.csv',
              contentType : 'text/csv',
              contents    : Papa.unparse(job.result.data, { delimiter: ';' })
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
            // attachments: _.map(matches, (alarm) => {
            //   var rule = alarm.rule;
            //   var message = `*${rule.name}*`;

            //   if (alarmLevelRank >= SEVERITIES[rule.severity].rank) {
            //     return {
            //       color: SEVERITIES[rule.severity].hexColor,
            //       fallback: message,
            //       text: message,
            //       mrkdwn_in: ["text"],
            //       fields: _.map(rule.conditions, (cond) => {
            //         var operator = OPERATORS[cond.op];
            //         var fieldValue = alarm.row[cond.field];

            //         return {
            //           title: '',
            //           value: `${cond.field} (${fieldValue}) ${operator.display} ${cond.value}`,
            //           short: true
            //         };
            //       })
            //     };
            //   }
            // })
          });
        });
      }
    }
  }

  return matches;
};