Template.visTimeSeries.onCreated(function() {
  Session.setDefault('chartSettings', {});
});


Template.visTimeSeries.onRendered(function() {
  var template = this;

  var chart = c3.generate({
    bindto: template.find('.chart'),
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

  this.autorun(() => {
    var data = Template.currentData().data;

    if (data) {
      var config = {
        columns: [
          [].concat(['month'], _.pluck(data, 'month')),
          [].concat(['data'], _.pluck(data, 'some_number')),
        ]
      };

      chart.load(_.extend(config, Session.get('chartSettings')));
    }
  });
});