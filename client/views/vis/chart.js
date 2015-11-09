Template.visChart.onRendered(function() {
  var template = this;

  var chart = c3.generate({
    bindto: template.find('.chart'),
    data: {
      columns: []
    }
  });

  this.autorun(() => {
    const context = Template.currentData();
    const columns = context.settings.columns;

    if (context.data && columns) {
      chart.load({
        json: context.data,
        keys: { value: columns },
        // columns: _.map(columns, (column) => {
        //   return [].concat([column], _.pluck(context.data, column));
        // }),
        unload: true,
        type: context.settings.chartType || 'line'
      });
    }
  });
});


Template.visChartForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});