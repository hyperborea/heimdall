const { isEqual } = require("lodash");
const qs = require("query-string");

loadHandler(Template.dashboardView);
var _id = () => Template.currentData().id;

Template.dashboardView.onCreated(function() {
  this.parameters = new ReactiveVar(qs.parse(location.hash));
  this.enabledAutorefresh = new ReactiveVar(false);

  this.autorun(() => {
    if (!Template.currentData().embedded) {
      this.subscribe("dashboard", _id());
    }
  });

  this.autorun(() => {
    const enabled = this.enabledAutorefresh.get();
    if (enabled) {
      this.timer = window.setInterval(() => {
        // Rerun all (parameterized) jobs that aren't running already.
        JobResults.find({ status: { $ne: "running" } }).map(jr => {
          console.log("refreshing");
          Meteor.call("runJob", jr.jobId, this.parameters.get());
        });
      }, 60 * 1000);
    } else {
      window.clearInterval(this.timer);
    }
  });
});

Template.dashboardView.onDestroyed(function() {
  window.clearInterval(this.timer);
});

Template.dashboardView.onRendered(function() {
  const template = this;

  var grid = this.$(".gridster")
    .gridster({
      widget_margins: [10, 10],
      widget_base_dimensions: [80, 60],
      // tricking gridster to autogenerate css for columns generously
      min_cols: 25,
      max_size_x: 20
    })
    .data("gridster")
    .disable();

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      var dashboard = Dashboards.findOne(_id());
      var widgets = dashboard ? dashboard.widgets : [];

      // Prefill params with default values set on dashboard level.
      const prevParams = template.parameters.get();
      const newParams = { ...qs.parse(dashboard.params), ...prevParams };
      if (!isEqual(prevParams, newParams)) {
        template.parameters.set(newParams);
        // Don't continue to rebuild widgets if we don't have the right params yet.
        return;
      }

      // Gridster tries to be clever and pushes widgets down if they don't fit in width.
      // That's not what we want though, so we're manually overriding the columns with the maximum to expect.
      grid.options.min_cols = _.max(_.map(widgets, w => w.col + w.size_x));

      grid.remove_all_widgets();
      _.each(widgets, widget => addWidget(grid, widget, template));
    }
  });
});

Template.dashboardView.helpers({
  dashboard: () => Dashboards.findOne(_id()),
  starredClass: () =>
    hasStarred("dashboard", _id()) ? "yellow star" : "star outline",
  refreshClass: () => Template.instance().enabledAutorefresh.get() && "blue",
  fullscreenClass: () => (isFullscreen() ? "compress" : "expand"),
  paramArray: function() {
    const template = Template.instance();
    const parameters = template.parameters.get();
    return _.chain(Jobs.find().fetch())
      .pluck("parameters")
      .reduce((memo, param) => _.extend(memo, param), {})
      .map((v, k) => Object({ name: k, value: parameters[k] || v }))
      .value();
  }
});

Template.dashboardView.events({
  "submit form.parameters": function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    location.hash = qs.stringify(data);
    template.parameters.set(data);
  },

  "click .js-toggle-star": function() {
    toggleStar("dashboard", _id());
  },

  "click .js-toggle-refresh": function(event, template) {
    template.enabledAutorefresh.set(!template.enabledAutorefresh.get());
  },

  "click .js-toggle-fullscreen": function() {
    FlowRouter.go(
      "dashboardView",
      { id: _id() },
      { fullscreen: !isFullscreen() }
    );
  },

  "click .js-present-mode": function() {
    FlowRouter.go("dashboardPresent", {}, { ids: _id() });
  }
});

function addWidget(grid, options, template) {
  options = options || {};
  let widgetNode = null;
  const dashboardId = _id();

  if (options.type === "visualization" && options.visId) {
    function reactiveContext() {
      return {
        id: options.visId,
        basic: options.basic,
        parameters: template.parameters.get(),
        dashboardId: dashboardId
      };
    }

    var widget = Blaze.renderWithData(
      Template.visualization,
      reactiveContext,
      grid.$el.get(0)
    );
    widgetNode = widget.firstNode();
  }

  if (options.type === "text") {
    var html = Markdown(options.text);
    widgetNode = $(`<div>${html}</div>`);
  }

  if (widgetNode) {
    grid.add_widget(
      widgetNode,
      options.size_x,
      options.size_y,
      options.col,
      options.row
    );
  }
}
