import CalHeatMap from "cal-heatmap";
import isEqual from "lodash/isEqual";
import minBy from "lodash/minBy";
import format from "date-fns/format";

import "cal-heatmap/cal-heatmap.css";

Template.visCalHeatmap.onRendered(function () {
  const template = this;
  const container = template.find(".container");
  let activeSettings = {};

  this.autorun(() => {
    const { settings, data } = Template.currentData();
    const hasChangedSettings = !isEqual(settings, activeSettings);
    activeSettings = settings;

    const { dateField, valueField } = settings;
    if (!dateField || !valueField) return;

    if (!this.cal || hasChangedSettings) {
      this.cal && this.cal.destroy();

      this.cal = new CalHeatMap();
      this.cal.init({
        itemSelector: container,
        domain: settings.domain,
        subDomain: settings.subdomain || null,
        start: minBy(data, dateField)[dateField],
        subDomainDateFormat: (date) =>
          format(date, settings.dateFormat || "YYYY-MM-DD HH:mm:ss"),
        subDomainTitleFormat: {
          empty: "{date}",
          filled: "{date}: {count}",
        },
        cellSize: settings.cellSize || 10,
        legendColors: {
          min: settings.minColor || "#dae289",
          max: settings.maxColor || "#3b6427",
        },
        subDomainTextFormat: (date, value) => {
          if (!(date instanceof Date)) {
            date = new Date(date);
          }

          switch (settings.cellFormat) {
            case "value":
              return value;
            case "day":
              return date.getDate();
            case "dow":
              return date.getDay();
            case "hour":
              return date.getHour();
            case "minute":
              return date.getMinute();
          }
        },
        range: settings.range || 12,
        tooltip: settings.tooltip,
        legend:
          settings.groups && settings.groups.length
            ? settings.groups
            : [10, 20, 30, 40],
      });
    }

    const payload = data.reduce((obj, item) => {
      const ts = Math.round(item[dateField].getTime() / 1000);
      obj[ts.toString()] = Number(item[valueField]);
      return obj;
    }, {});

    this.cal.update(payload);
  });
});
