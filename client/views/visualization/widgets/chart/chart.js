import _ from "lodash";
import d3 from "d3";
import c3 from "c3";

Template.visChart.onRendered(function () {
  var template = this;
  var container = template.find(".chart");

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;

    let data = context.data;
    let series = settings.series || [];
    let groups = settings.groups;

    if (data) {
      if (settings.dynamic && settings.dynamic.enabled) {
        const seriesField = settings.dynamic.seriesField;
        const valueField = settings.dynamic.valueField;
        const xAxisField = settings.timeField || settings.categoryField;

        let sortedSeries = _.chain(data).map(seriesField).uniq().value();

        switch (settings.dynamic.sort) {
          case "sum_total":
            sortedSeries = _.chain(data)
              .groupBy(seriesField)
              .mapValues((arr) => _.sumBy(arr, (o) => Number(o[valueField])))
              .map((v, k) => ({ name: k, value: v }))
              .sortBy("value")
              .reverse()
              .map("name")
              .value();
            break;
          case "name_asc":
            sortedSeries = sortedSeries.sort();
            break;
          case "name_desc":
            sortedSeries = sortedSeries.sort().reverse();
            break;
        }

        const limit = settings.dynamic.limit || 20;
        const seriesNames = _.slice(sortedSeries, 0, limit);
        if (seriesNames.length < sortedSeries.length) {
          seriesNames.push("other");
        }

        const store = {};
        data.forEach((row) => {
          const x = row[xAxisField];
          const y = row[valueField];
          let s = row[seriesField];
          let obj = {};

          if (!seriesNames.includes(s)) {
            if (settings.dynamic.hideOther) return;
            s = "other";
          }

          if (store.hasOwnProperty(x)) {
            obj = store[x];
          } else {
            store[x] = obj;
            obj[xAxisField] = x;
          }

          obj[s] = (obj[s] || 0) + Number(y);
        });

        data = Object.values(store);
        series = Array.from(seriesNames).map((x) => ({
          field: x,
          type: settings.dynamic.chartType,
          yAxis: "y",
        }));

        if (settings.dynamic.stacked) {
          groups = [Array.from(seriesNames)];
        }

        if (settings.dynamic.ratio) {
          data = data.map((item) => {
            const sum = _.chain(item).pick(seriesNames).values().sum().value();
            seriesNames.forEach((k) => {
              // Make sure there's no gaps.
              if (!item.hasOwnProperty(k)) {
                item[k] = 0;
              }
              // Update value with the relative ratio.
              if (sum) {
                item[k] = Number(item[k]) / sum;
              }
            });
            return item;
          });
        }
      }

      const fields = _.map(series, "field");
      series.forEach((s) => (s.name = s.name || s.field));

      var config = {
        bindto: container,
        data: {
          json: data,
          keys: { value: fields },
          groups: groups,
          types: _.zipObject(fields, _.map(series, "type")),
          axes: _.zipObject(fields, _.map(series, "yAxis")),
          colors: _.zipObject(fields, _.map(series, "color")),
          classes: _.zipObject(fields, _.map(series, "lineType")),
          names: _.zipObject(fields, _.map(series, "name")),
          order: null,
        },
        size: {
          height: settings.height,
        },
        axis: {
          x: {
            label: {
              text: settings.labelX,
              position: settings.labelX && "outer-right",
            },
            tick: {
              format: settings.formatX
                ? d3.format(settings.formatX)
                : undefined,
            },
            min: settings.minX,
            max: settings.maxX,
          },
          y: {
            label: {
              text: settings.labelY,
              position: settings.labelY && "outer-top",
            },
            tick: {
              format: settings.formatY
                ? d3.format(settings.formatY)
                : undefined,
            },
            min: settings.minY,
            max: settings.maxY,
          },
          y2: {
            show: _.filter(series, { yAxis: "y2" }).length > 0,
            label: {
              text: settings.labelY2,
              position: settings.labelY2 && "outer-top",
            },
            tick: {
              format: settings.formatY2
                ? d3.format(settings.formatY2)
                : undefined,
            },
            min: settings.minY2,
            max: settings.maxY2,
          },
        },
        grid: {
          x: {
            show: settings.gridX,
            lines: _.filter(settings.gridLines, { axis: "x" }),
          },
          y: {
            show: settings.gridY,
            lines: _.filter(settings.gridLines, { axis: "y" }),
          },
        },
        point: {
          show: !settings.hidePoints,
        },
        subchart: {
          show: settings.subchart,
        },
        tooltip: {
          contents: function (
            d,
            defaultTitleFormat,
            defaultValueFormat,
            color
          ) {
            var formatTitle = defaultTitleFormat;
            var formatValue = settings.formatY
              ? d3.format(settings.formatY)
              : (x) => x;

            if (d.length > 1) {
              defaultTitleFormat = function (title) {
                var sum = d.reduce((tot, item) => tot + item.value, 0);
                return formatTitle(title) + " - " + formatValue(sum);
              };
            }

            return c3.chart.internal.fn.getTooltipContent.apply(
              this,
              arguments
            );
          },
        },
      };

      if (settings.timeField) {
        config.data.x = settings.timeField;
        config.data.keys.value.push(settings.timeField);
        config.axis.x.type = "timeseries";
        config.axis.x.tick = { format: settings.timeFormat || "%Y-%m-%d" };
      }

      if (settings.categoryField) {
        config.data.x = settings.categoryField;
        config.data.keys.value.push(settings.categoryField);
        config.axis.x.type = "category";
        config.axis.x.tick.culling = true;
        config.axis.x.tick.multiline = false;
      }

      c3.generate(config);
    }
  });
});
