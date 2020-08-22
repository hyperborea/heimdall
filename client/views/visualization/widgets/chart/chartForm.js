function newSeries() {
  return {
    _id: Random.id(),
    type: "line",
    lineType: "solid",
    yAxis: "y",
  };
}

const CHART_TYPES = [
  { value: "line", text: "line", icon: "line chart" },
  { value: "spline", text: "spline", icon: "line chart" },
  { value: "area", text: "area", icon: "area chart" },
  { value: "bar", text: "bar", icon: "bar chart" },
];

Template.visChartForm.onRendered(function () {
  this.$(".ui.checkbox").checkbox();
  this.$(".tabular.menu .item").tab();
});

Template.visChartFormSeries.onCreated(function () {
  const settings = Template.currentData().settings;
  this.series = new ReactiveVar(settings.series || [newSeries()]);
  this.groups = new ReactiveVar(settings.groups || []);
});

Template.visChartFormSeries.helpers({
  seriesArray: () => Template.instance().series.get(),
  groupsArray: () => Template.instance().groups.get(),
  limitOptions: [
    { value: 0, text: "none" },
    { value: 3, text: "3" },
    { value: 5, text: "5" },
    { value: 7, text: "7" },
    { value: 10, text: "10" },
  ],
  sortOptions: [
    { value: "", text: "none" },
    { value: "sum_total", text: "sum (total)" },
    { value: "name_asc", text: "name (ascending)" },
    { value: "name_desc", text: "name (descending)" },
  ],
  chartOptions: CHART_TYPES,
});

Template.visChartFormSeriesItem.helpers({
  lineTypes: ["solid", "bold", "dashed", "dotted", "alternating", "animated"],
  types: CHART_TYPES,
  yAxes: [
    { value: "y", text: "Y axis" },
    { value: "y2", text: "Y2 axis" },
  ],

  namePath: (addendum) => {
    var data = Template.currentData();
    return `series[${data.index}]${addendum}`;
  },
});

Template.visChartFormSeriesItem.events({
  'change [name$="[field]"]': function (event, template) {
    template
      .$('[name$="[name]"]')
      .attr("placeholder", event.target.value)
      .val("");
  },
});

Template.visChartFormGroupItem.helpers({
  path: (index) => `groups[${index}]:list`,
});

Template.visChartFormSeries.events({
  "click .js-add-series": function (event, template) {
    var series = template.series.get();

    series.push(newSeries());
    template.series.set(series);
  },

  "click .js-remove-series": function (event, template) {
    var index = Blaze.getData(event.target).index;
    var series = template.series.get();

    series.splice(index, 1);
    template.series.set(series);
  },

  "click .js-add-group": function (event, template) {
    var groups = template.groups.get();

    groups.push([]);
    template.groups.set(groups);
  },

  "click .js-remove-group": function (event, template) {
    var index = Blaze.getData(event.target).index;
    var groups = template.groups.get();

    groups.splice(index, 1);
    template.groups.set(groups);
  },

  "click .js-enable-dynamic": function (event, template) {
    template.$(".checkbox-dynamic").checkbox("check");
  },

  "click .js-disable-dynamic": function (event, template) {
    template.$(".checkbox-dynamic").checkbox("uncheck");
  },
});

Template.visChartFormGrid.onCreated(function () {
  this.gridLines = new ReactiveVar(this.data.settings.gridLines || []);
});

Template.visChartFormGrid.onRendered(function () {
  this.$(".ui.checkbox").checkbox();
});

Template.visChartFormGridLine.onRendered(function () {
  this.$(".ui.dropdown").dropdown();
});

Template.visChartFormGrid.helpers({
  gridLines: () => Template.instance().gridLines.get(),
});

Template.visChartFormGrid.events({
  "click .js-add-line": function (event, template) {
    var gridLines = template.gridLines.get();

    gridLines.push({
      axis: "y",
      position: "end",
    });
    template.gridLines.set(gridLines);
  },

  "click .js-remove-line": function (event, template) {
    var index = $(event.target).data("index");
    var gridLines = template.gridLines.get();

    gridLines.splice(index, 1);
    template.gridLines.set(gridLines);

    Tracker.afterFlush(() => {
      template
        .$(".ui.dropdown")
        .dropdown("save defaults")
        .dropdown("restore defaults");
    });
  },
});
