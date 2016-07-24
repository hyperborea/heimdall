import c3 from 'c3';

Template.visChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  var $node = $(template.firstNode);
  var $wrapper = $node.closest('.visualizationWrapper');

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;
    let series = settings.series || [];

    if (context.data) {
      var fields = _.pluck(series, 'field');
      series.forEach(s => s.name = s.name || s.field);

      var config = {
        bindto: container,
        data: {
          json    : context.data,
          keys    : { value: fields },
          groups  : settings.groups,
          types   : _.object(fields, _.pluck(series, 'type')),
          axes    : _.object(fields, _.pluck(series, 'yAxis')),
          colors  : _.object(fields, _.pluck(series, 'color')),
          classes : _.object(fields, _.pluck(series, 'lineType')),
          names   : _.object(fields, _.pluck(series, 'name')),
          order   : null,
        },
        size: {
          height: $wrapper.height() - 70
        },
        axis: {
          x: {
            label: {
              text: settings.labelX,
              position: settings.labelX && 'outer-right'
            },
            tick: {
              format: settings.formatX ? d3.format(settings.formatX) : undefined
            },
            min: settings.minX,
            max: settings.maxX
          },
          y: {
            label: {
              text: settings.labelY,
              position: settings.labelY && 'outer-top'
            },
            tick: {
              format: settings.formatY ? d3.format(settings.formatY) : undefined
            },
            min: settings.minY,
            max: settings.maxY
          },
          y2: {
            show: _.where(series, {yAxis: 'y2'}).length > 0,
            label: {
              text: settings.labelY2,
              position: settings.labelY2 && 'outer-top'
            },
            tick: {
              format: settings.formatY2 ? d3.format(settings.formatY2) : undefined
            },
            min: settings.minY2,
            max: settings.maxY2
          }
        },
        grid: {
          x: {
            show: settings.gridX,
            lines: _.where(settings.gridLines, {axis: 'x'})
          },
          y: {
            show: settings.gridY,
            lines: _.where(settings.gridLines, {axis: 'y'})
          }
        },
        point: {
          show: !settings.hidePoints
        }
      };

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

      c3.generate(config);
    }
  });
});