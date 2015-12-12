Template.visPieChart.onRendered(function() {
  var template = this;
  var container = template.find('.chart');

  var $node = $(template.firstNode);
  var $wrapper = $node.closest('.visualizationWrapper');

  this.autorun(() => {
    const context = Template.currentData();
    const settings = context.settings;

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
        columns: _.map(data, (item) => item),
        type: settings.chartType || 'pie',
      },
      size: {
        height: $wrapper.height() - 50
      },
    });
  });
});


Template.visPieChartForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});