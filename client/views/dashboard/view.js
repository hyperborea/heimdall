Template.dashboardView.onCreated(function() {
  this.subscribe('dashboards');
  this.subscribe('jobs');
});


Template.dashboardView.onRendered(function() {
  var grid = this.$('.gridster').gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [200, 150]
  }).data('gridster');

  this.autorun(() => {
    var dashboard = Dashboards.findOne(FlowRouter.getParam('id'));
    var widgets = dashboard ? dashboard.widgets : [];

    grid.remove_all_widgets();

    _.each(widgets, (widget) => {
      addWidget(grid, widget);
    });
  });
});


Template.dashboardView.helpers({
  doc: function() {
    return Dashboards.findOne(FlowRouter.getParam('id'));
  }
});


function addWidget(grid, options) {
  options = options || {};

  var job = Jobs.findOne(options.jobId);

  if (job) {
    var widget = Blaze.renderWithData(Template.visualization, job, grid.$el.get(0));
    var widgetNode = widget.firstNode();

    grid.add_widget(widgetNode, options.size_x, options.size_y, options.col, options.row);  
  }
}