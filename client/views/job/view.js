Template.jobView.onCreated(function() {
  this.subscribe('jobs');
});


Template.jobView.helpers({
  job: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  }
});


Template.jobView.events({
  'click .js-query': function(event, template) {
    Meteor.call('runJob', $(event.target).data('id'));
  }
});