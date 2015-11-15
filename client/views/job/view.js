Template.jobView.onCreated(function() {
  this.subscribe('jobs');
});


Template.jobView.helpers({
  job: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  }
});