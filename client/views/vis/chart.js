Template.visChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  this.autorun(() => {
    const context = Template.currentData();

    if (context.data && context.settings.columns) {
      var config = {
        bindto: container,
        data: {
          json: context.data,
          keys: { value: context.settings.columns },
          type: context.settings.chartType || 'line'
        }
      };

      if (context.settings.timeField) {
        config.data.x = context.settings.timeField;
        config.data.keys.value.push(context.settings.timeField);
        config.axis = {
          x: {
            type: 'timeseries',
            tick: {
              format: '%Y-%m-%d'
            }
          }
        };
      }

      c3.generate(config);
    }
  });
});


Template.visChartForm.onRendered(function() {
  this.$('.ui.single.dropdown').dropdown();
  this.$('.ui.multiple.dropdown').dropdown({allowAdditions: true});
});


Template.visChartForm.events({
  'click .foo': function(event, template) {
    event.preventDefault();
    console.log(event.target);
  }
});