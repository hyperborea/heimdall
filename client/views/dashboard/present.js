function _getDashboardIds() {
  return (FlowRouter.getQueryParam("ids") || "").split(",");
}

Template.dashboardPresent.onCreated(function () {
  this.subscribe("dashboards");
  this.currentDashboardId = new ReactiveVar();

  var template = this;
  var currentDashboard = undefined;
  var timer = undefined;

  template.autorun(() => {
    FlowRouter.watchPathChange();
    if (timer) Meteor.clearTimeout(timer);

    var ids = _getDashboardIds();
    var speed = FlowRouter.getQueryParam("speed") || 10000;

    ids.forEach((dashboardId) => {
      template.subscribe("dashboard", dashboardId);
    });

    function transition(delay) {
      timer = Meteor.setTimeout(function () {
        var index = ids.indexOf(currentDashboard);
        var nextIndex = index < ids.length - 1 ? index + 1 : 0;

        // break cycle if there's nothing to rotate
        if (currentDashboard === ids[nextIndex]) return;

        currentDashboard = ids[nextIndex];
        template.currentDashboardId.set(currentDashboard);
        transition(speed);
      }, delay);
    }

    transition(0);
  });
});

Template.dashboardPresent.onRendered(function () {
  this.$(".ui.checkbox").checkbox();
});

Template.dashboardPresent.helpers({
  dashboardIds: _getDashboardIds,
  currentDashboardId: () => Template.instance().currentDashboardId.get(),

  dashboardItems: function () {
    return Dashboards.find().map((dashboard) => {
      return {
        value: dashboard._id,
        text: dashboard.title,
      };
    });
  },
});

Template.dashboardPresent.events({
  "submit form": function (event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    FlowRouter.go("dashboardPresent", {}, data);
  },

  "click .js-go-fullscreen": function (event, template) {
    FlowRouter.setQueryParams({ fullscreen: true });
  },

  "click .js-close-fullscreen": function (event, template) {
    FlowRouter.setQueryParams({ fullscreen: false });
  },
});
