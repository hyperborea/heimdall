Meteor.setInterval(() => {
  Session.set('currentTime', Date.now());
}, 10000);


Template.jobList.helpers({
  jobs: function() {
    return Jobs.find({}, {sort: {createdAt: -1}});
  },

  timeAgo: function(ts) {
    var now = moment(Session.get('currentTime'));
    var ts = moment(ts);

    return moment.min(ts, now).fromNow();
  }
});