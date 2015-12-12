Template.visChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  var $node = $(template.firstNode);
  var $wrapper = $node.closest('.visualizationWrapper');

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;

    if (context.data) {
      var fieldSettings = {};
      _.each(settings.series, (series) => {
        _.each(series.columns, (field) => {
          fieldSettings[field] = {
            type  : series.type || 'line',
            yAxis : series.yAxis || 'y'
          };
        });
      });

      var config = {
        bindto: container,
        data: {
          json: context.data,
          keys: { value: _.keys(fieldSettings) },
          groups: _.map(settings.series, (series) => series.columns),
          types: _.object(_.keys(fieldSettings), _.pluck(fieldSettings, 'type')),
          axes: _.object(_.keys(fieldSettings), _.pluck(fieldSettings, 'yAxis'))
        },
        size: {
          height: $wrapper.height() - 50
        },
        axis: {
          x: {
            label: {
              text: settings.labelX,
              position: settings.labelX && 'outer-right'
            },
            min: settings.minX,
            max: settings.maxX
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
            show: _.where(fieldSettings, {yAxis: 'y2'}).length > 0,
            label: {
              text: settings.labelY2,
              position: settings.labelY2 && 'outer-top'
            },
            min: settings.minY2,
            max: settings.maxY2
          }
        },
        grid: {
          x: { show: settings.gridX },
          y: { show: settings.gridY }
        }
      };

      console.log(config);

      if (settings.timeField) {
        config.data.x = settings.timeField;
        config.data.keys.value.push(settings.timeField);
        config.axis.x.type = 'timeseries';
        config.axis.x.tick = { format: settings.timeFormat || '%Y-%m-%d' };
      }

      if (settings.categoryField) {
        config.data.x = settings.categoryField;
        config.data.keys.value.push(settings.categoryField);
        config.axis.x.type = 'category';
      }

      if (_.contains(_.pluck(fieldSettings, 'type'), 'pie')) {
        var valField = settings.series[0].columns[0];
        var catField = settings.categoryField;

        var data = _.groupBy(context.data, catField);
        _.each(data, (items, cat) => {
          data[cat] = _.pluck(items, valField);
        });

        config.data = {
          json: data,
          type: 'pie'
        };
      }

      c3.generate(config);
    }
  });
});