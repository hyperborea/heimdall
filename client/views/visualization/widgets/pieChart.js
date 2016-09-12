import d3 from 'd3';
import c3 from 'c3';

Template.visPieChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;

    if (settings.categoryField && settings.valueField) {
      let data = {};
      _.each(context.data, (row) => {
        let cat = row[settings.categoryField];
        let val = row[settings.valueField];

        data[cat] = data[cat] || [cat];
        data[cat].push(val);
      });

      c3.generate({
        bindto: container,
        data: {
          columns: _.values(data),
          type: settings.chartType || 'pie',
        },
        size: {
          height: settings.height
        },
        pie: {
          label: {
            format: (value, ratio) => {
              if (settings.showValue) 
                return d3.format(',')(value);
              else
                return d3.format('.1%')(ratio);
            }
          }
        },
        donut: {
          label: {
            format: (value, ratio) => {
              if (settings.showValue) 
                return d3.format(',')(value);
              else
                return d3.format('.1%')(ratio);
            }
          }
        }
      });
    }
  });
});


Template.visPieChartForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});