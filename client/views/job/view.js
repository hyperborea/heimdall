Template.jobView.helpers({
  doc: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  }
});