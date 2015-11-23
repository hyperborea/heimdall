Template.visChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  var $node = $(template.firstNode);
  var $wrapper = $node.closest('.visualizationWrapper');

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;

    if (context.data && settings.columns) {
      var config = {
        bindto: container,
        data: {
          json: context.data,
          keys: { value: settings.columns },
          type: settings.chartType || 'line'
        },
        size: {
          height: $wrapper.height() - 50
        },
        axis: {
          x: {
            label: {
              text: settings.labelX,
              position: settings.labelX && 'outer-right'
            }
          },
          y: {
            label: {
              text: settings.labelY,
              position: settings.labelY && 'outer-top'
            }
          }
        }
      };

      if (settings.timeField) {
        config.data.x = settings.timeField;
        config.data.keys.value.push(settings.timeField);
        config.axis.x.type = 'timeseries';
        config.axis.x.tick = { format: '%Y-%m-%d' };
      }

      if (settings.categoryField) {
        config.data.x = settings.categoryField;
        config.data.keys.value.push(settings.categoryField);
        config.axis.x.type = 'category';
      }

      if (settings.chartType === 'pie') {
        var valField = settings.columns[0];
        var catField = settings.categoryField;

        var data = _.groupBy(context.data, catField);
        _.each(data, (items, cat) => {
          data[cat] = _.pluck(items, valField);
        });

        config.data = {
          json: data,
          type: settings.chartType
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