const SERIES_DEFAULT = {
  type: 'line',
  yAxis: 'y'
};


Template.visChartForm.onRendered(function() {
  this.$('.ui.single.dropdown').dropdown();
  this.$('.tabular.menu .item').tab();
});


Template.visChartFormSeries.onCreated(function() {
  this.series = new ReactiveVar(this.data.settings.series || [SERIES_DEFAULT]);
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
    
    series.push(SERIES_DEFAULT);
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