function newSeries() {
  return {
    _id: Random.id(),
    type: 'line',
    yAxis: 'y'
  };
}


Template.visChartForm.onRendered(function() {
  this.$('.ui.single.dropdown').dropdown();
  this.$('.tabular.menu .item').tab();
});


Template.visChartFormSeries.onCreated(function() {
  this.series = new ReactiveVar(this.data.settings.series || [newSeries()]);
});

Template.visChartFormSeriesItem.onRendered(function() {
  this.$('.ui.single.dropdown').dropdown();
  this.$('.ui.multiple.dropdown').dropdown({allowAdditions: true});
});

Template.visChartFormSeries.helpers({
  seriesArray: function() {
    return Template.instance().series.get();
  }
});

Template.visChartFormSeriesItem.helpers({
  namePath: (addendum) => {
    var data = Template.currentData();
    return `series[${data.index}]${addendum}`;
  }
});

Template.visChartFormSeries.events({
  'click .js-add-series': function(event, template) {
    var series = template.series.get();
    
    series.push(newSeries());
    template.series.set(series);
  },

  'click .js-remove-series': function(event, template) {
    var index = Blaze.getData(event.target).index;
    var series = template.series.get();
    
    series.splice(index, 1);
    template.series.set(series);
  }
});


Template.visChartFormGrid.onCreated(function() {
  this.gridLines = new ReactiveVar(this.data.settings.gridLines || []);
});

Template.visChartFormGrid.onRendered(function() {
  this.$('.ui.checkbox').checkbox();
});

Template.visChartFormGridLine.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});

Template.visChartFormGrid.helpers({
  gridLines: () => Template.instance().gridLines.get()
});

Template.visChartFormGrid.events({
  'click .js-add-line': function(event, template) {
    var gridLines = template.gridLines.get();

    gridLines.push({
      axis: 'y',
      position: 'end'
    });
    template.gridLines.set(gridLines);
  },

  'click .js-remove-line': function(event, template) {
    var index = $(event.target).data('index');
    var gridLines = template.gridLines.get();
    
    gridLines.splice(index, 1);
    template.gridLines.set(gridLines);

    Tracker.afterFlush(() => {
      template.$('.ui.dropdown').dropdown('save defaults').dropdown('restore defaults');
    });
  }
});