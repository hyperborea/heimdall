Template.jobView.onCreated(function() {
  this.subscribe('jobs');
});


Template.jobView.helpers({
  doc: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  },

  hasErrors: function() {
    return this.result && this.result.status == 'error';
  },

  data: function() {
    return (this.result && this.result.data) ? JSON.stringify(this.result.data) : '-';
  },

  dataKeys: function() {
    return (this.result && this.result.data) ? _.keys(this.result.data[0]) : [];
  },
  getField: function(row, key) {
    return row[key];
  }
});


// Template.jobView.events({
//   'click .js-query': function() {
//     Meteor.call('query', this._id, this.query);
//   }
// });