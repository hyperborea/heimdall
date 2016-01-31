loadHandler(Template.dashboardView);

Template.dashboardView.onCreated(function() {
  this.autorun(() => {
    this.subscribe('dashboard', FlowRouter.getParam('id'));
  });
});


Template.dashboardView.onRendered(function() {
  var grid = this.$('.gridster').gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [80, 60],
    max_size_x: 20
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
  },

  fullscreenClass: function() {
    return isFullscreen() ? 'remove' : 'maximize';
  }
});


Template.dashboardView.events({
  'click .js-toggle-star': function() {
    toggleStar('dashboard', FlowRouter.getParam('id'));
  },

  'click .js-toggle-fullscreen': function() {
    // var query = isFullscreen() ? {} : {fullscreen: true};
    FlowRouter.go('dashboardView', {
      id: FlowRouter.getParam('id')
    }, {
      fullscreen: !isFullscreen()
    });
  }
});


function addWidget(grid, options) {
  options = options || {};
  var widgetNode = null;

  if (options.type === 'visualization') {
    var vis = Visualizations.findOne(options.visId);

    if (vis) {
      var data = {
        vis      : vis,
        result   : vis.job().result,
        visBasic : options.basic
      };

      var widget = Blaze.renderWithData(Template.visualization, data, grid.$el.get(0));
      widgetNode = widget.firstNode();
    }
  }

  if (options.type === 'text') {
    var html = Markdown(options.text);
    widgetNode = $(`<div>${html}</div>`);
  }

  if (widgetNode) {
    grid.add_widget(widgetNode, options.size_x, options.size_y, options.col, options.row);  
  }
}