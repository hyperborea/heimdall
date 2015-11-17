Template.jobView.onCreated(function() {
  this.subscribe('job', FlowRouter.getParam('id'));
});


Template.jobView.helpers({
  job: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  }
});