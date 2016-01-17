loadHandler(Template.dashboardView);

Template.dashboardView.onCreated(function() {
  this.autorun(() => {
    this.subscribe('dashboard', FlowRouter.getParam('id'));
  });
});


Template.dashboardView.onRendered(function() {
  var grid = this.$('.gridster').gridster({
    widget_margins: [10, 20],
    widget_base_dimensions: [200, 150],
    max_size_x: 10
  }).data('gridster').disable();

  this.autorun(() => {
    var dashboard = Dashboards.findOne(FlowRouter.getParam('id'));
    var widgets = dashboard ? dashboard.widgets : [];

    grid.remove_all_widgets();
    _.each(widgets, (widget) => addWidget(grid, widget));
  });
});


Template.dashboardView.helpers({
  doc: function() {
    return Dashboards.findOne(FlowRouter.getParam('id'));
  },

  loadingClass: function() {
    return Session.get('isLoading') && 'hidden';
  },

  starredClass: function(doc) {
    return hasStarred('dashboard', FlowRouter.getParam('id')) ? 'yellow' : 'empty';
  }
});


Template.dashboardView.events({
  'click .js-toggle-star': function() {
    toggleStar('dashboard', FlowRouter.getParam('id'));
  },
});


function addWidget(grid, options) {
  options = options || {};

  var vis = Visualizations.findOne(options.visId);

  if (vis) {
    var data = {
      vis    : vis,
      result : vis.job().result,
    };

    var widget = Blaze.renderWithData(Template.visualization, data, grid.$el.get(0));
    var widgetNode = widget.firstNode();

    grid.add_widget(widgetNode, options.size_x, options.size_y, options.col, options.row);  
  }
}