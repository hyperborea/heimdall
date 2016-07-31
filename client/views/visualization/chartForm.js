function newSeries() {
  return {
    _id: Random.id(),
    type: 'line',
    lineType: 'solid',
    yAxis: 'y'
  };
}


Template.visChartForm.onRendered(function() {
  this.$('.ui.checkbox').checkbox();
  this.$('.ui.single.dropdown').dropdown();
  this.$('.tabular.menu .item').tab();
});


Template.visChartFormSeries.onCreated(function() {
  this.series = new ReactiveVar(this.data.settings.series || [newSeries()]);
  this.groups = new ReactiveVar(this.data.settings.groups || []);
});

Template.visChartFormSeriesItem.onRendered(function() {
  this.$('.ui.single.dropdown').dropdown();
  this.$('.ui.multiple.dropdown').dropdown({allowAdditions: true});
});

Template.visChartFormSeries.helpers({
  seriesArray: () => Template.instance().series.get(),
  groupsArray: () => Template.instance().groups.get(),
});

Template.visChartFormSeriesItem.helpers({
  lineTypes: ['solid', 'bold', 'dashed', 'dotted', 'alternating', 'animated'],
  types: [
    { value: 'line', text: 'line', icon: 'line chart' },
    { value: 'spline', text: 'spline', icon: 'line chart' },
    { value: 'area', text: 'area', icon: 'area chart' },
    { value: 'bar', text: 'bar', icon: 'bar chart' },
  ],

  namePath: (addendum) => {
    var data = Template.currentData();
    return `series[${data.index}]${addendum}`;
  }
});

Template.visChartFormSeriesItem.events({
  'change [name$="[field]"]': function(event, template) {
    template.$('[name$="[name]"]').attr('placeholder', event.target.value).val('');
  }
});

Template.visChartFormGroupItem.helpers({
  path: (index) => `groups[${index}]:list`
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
  },

  'click .js-add-group': function(event, template) {
    var groups = template.groups.get();

    groups.push([]);
    template.groups.set(groups);
  },

  'click .js-remove-group': function(event, template) {
    var index = Blaze.getData(event.target).index;
    var groups = template.groups.get();
    
    groups.splice(index, 1);
    template.groups.set(groups);
  },
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