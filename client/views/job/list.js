// loadHandler(Template.jobList);

Template.jobList.onCreated(function() {
  this.subscribe('jobs');
});


Template.jobList.helpers({
  jobs: function() {
    return Jobs.find({}, {sort: {createdAt: -1}});
  }
});