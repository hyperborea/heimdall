Template.visPieChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  var $node = $(template.firstNode);
  var $wrapper = $node.closest('.visualizationWrapper');

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
          height: $wrapper.height() - 50
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
        }
      });
    }
  });
});


Template.visPieChartForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});