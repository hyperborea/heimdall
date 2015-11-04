Template.jobView.onCreated(function() {
  this.subscribe('jobs');
});


Template.jobView.onRendered(function() {
  var chart = c3.generate({
    bindto: d3.select('.chart'),
    data: {
      x: 'month',
      columns: [
        ['month'],
        ['data']
      ]
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m'
        }
      }
    }
  });

  this.autorun(function() {
    var job = Jobs.findOne(FlowRouter.getParam('id'));
    if (job) {
      var data = job.result.data;

      chart.load({
        columns: [
          [].concat(['month'], _.pluck(data, 'month')),
          [].concat(['data'], _.pluck(data, 'some_number')),
        ]
      });
    }
  });
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