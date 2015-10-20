Template.jobView.helpers({
  doc: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  },

  data: function() {
    return this.result ? JSON.stringify(this.result) : '-';
  },

  dataKeys: function() {
    return this.result ? _.keys(this.result[0]) : [];
  },
  getField: function(row, key) {
    console.log(this, row, key);
    return row[key];
  }
});


Template.jobView.events({
  'click .js-query': function() {
    Meteor.call('query', this._id, this.query);
  }
});