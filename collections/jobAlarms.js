JobAlarms = new Mongo.Collection('jobAlarms');

Meteor.startup(function() {
  if (!Meteor.isServer) return;
  JobAlarms._ensureIndex({ status: 1 }); 
  JobAlarms._ensureIndex({ jobId: 1 });  
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
    requireOwnership(this.userId, job);

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

  Jobs.update(job._id, {
    $set: {
      alarmStatus: _.chain(matches)
        .map((alarm) => alarm.rule.severity)
        .sortBy((level) => SEVERITIES[level].rank)
        .first().value()
    }
  });

  return matches;
};