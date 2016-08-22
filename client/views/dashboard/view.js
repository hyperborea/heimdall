loadHandler(Template.dashboardView);
var _id = () => Template.currentData().id;


Template.dashboardView.onCreated(function() {
  this.autorun(() => {
    Template.currentData().embedded || this.subscribe('dashboard', _id());
  });
});


Template.dashboardView.onRendered(function() {
  var grid = this.$('.gridster').gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [80, 60],
    max_size_x: 20
  }).data('gridster').disable();

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      var dashboard = Dashboards.findOne(_id());
      var widgets = dashboard ? dashboard.widgets : [];

      grid.remove_all_widgets();
      _.each(widgets, (widget) => addWidget(grid, widget));  
    }
  });
});


Template.dashboardView.helpers({
  doc: function() {
    return Dashboards.findOne(_id());
  },

  starredClass: function(doc) {
    return hasStarred('dashboard', _id()) ? 'yellow' : 'empty';
  },

  fullscreenClass: function() {
    return isFullscreen() ? 'minimize' : 'maximize';
  }
});


Template.dashboardView.events({
  'click .js-toggle-star': function() {
    toggleStar('dashboard', _id());
  },

  'click .js-toggle-fullscreen': function() {
    FlowRouter.go('dashboardView', {
      id: _id()
    }, {
      fullscreen: !isFullscreen()
    });
  },

  'click .js-present-mode': function() {
    FlowRouter.go('dashboardPresent', {}, { ids: _id() });
  }
});


function addWidget(grid, options) {
  options = options || {};
  var widgetNode = null;

  if (options.type === 'visualization') {
    var vis = Visualizations.findOne(options.visId);

    if (vis && vis.job()) {
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