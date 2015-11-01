Template.jobList.helpers({
  jobs: function() {
    return Jobs.find({}, {sort: {createdAt: -1}});
  }
});


Template.jobList.onCreated(function() {
  this.subscribe('jobs');
});