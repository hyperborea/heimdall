Template.visChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  var $node = $(template.firstNode);
  var $wrapper = $node.closest('.visualizationWrapper');

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;

    if (context.data) {
      var fieldTypes = {};
      _.each(settings.series, (series) => {
        _.each(series.columns, (field) => {
          fieldTypes[field] = series.type;
        });
      });

      var config = {
        bindto: container,
        data: {
          json: context.data,
          keys: { value: _.keys(fieldTypes) },
          groups: _.map(settings.series, (series) => series.columns),
          types: fieldTypes
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
            },
            min: settings.minY,
            max: settings.maxY
          },
          y2: {
            label: {
              text: settings.labelY2,
              position: settings.labelY2 && 'outer-top'
            }
          }
        }
      };

      if (settings.y2Field) {
        config.data.axes = {};
        config.data.axes[settings.y2Field] = 'y2';
        config.axis.y2.show = true;
      }

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
  this.$('.tabular.menu .item').tab();
});


Template.visChartFormSeries.onCreated(function() {
  this.series = new ReactiveVar(this.data.settings.series || []);
});


Template.visChartFormSeriesTypes.onRendered(function() {
  this.$('.ui.single.dropdown').dropdown();
});


Template.visChartFormSeriesFields.onRendered(function() {
  this.$('.ui.multiple.dropdown').dropdown({allowAdditions: true});
});


Template.visChartFormSeries.helpers({
  seriesArray: function() {
    return Template.instance().series.get();
  },

  fieldName: function(index, name) {
    return `series[${index}][${name}]`;
  }
});

Template.visChartFormSeries.events({
  'click .js-add-series': function(event, template) {
    var series = template.series.get();
    
    series.push({});
    template.series.set(series);
  },

  'click .js-remove-series': function(event, template) {
    var index = $(event.target).data('index');
    var series = template.series.get();
    
    series.splice(index, 1);
    template.series.set(series);

    Tracker.afterFlush(() => {
      template.$('.ui.dropdown').dropdown('save defaults').dropdown('restore defaults');
    });
  }
});