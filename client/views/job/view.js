Template.jobView.onCreated(function() {
  this.subscribe('jobs');
});


Template.jobView.helpers({
  doc: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  }
});


Template.jobView.events({
  'click .js-query': function() {
    Meteor.call('runJob', this._id);
  }
});