loadHandler(Template.dashboardList);

function dashboardFilter() {
  var selector = {};

  if (FlowRouter.getQueryParam("search"))
    selector["$or"] = [
      { title: { $regex: FlowRouter.getQueryParam("search"), $options: "i" } },
      { owner: { $regex: FlowRouter.getQueryParam("search"), $options: "i" } },
      { tags: FlowRouter.getQueryParam("search") }
    ];
  if (FlowRouter.getQueryParam("filterOwn") === "true")
    selector["ownerId"] = Meteor.userId();
  if (FlowRouter.getQueryParam("tag"))
    selector["tags"] = FlowRouter.getQueryParam("tag");

  return selector;
}

Template.dashboardList.onCreated(function() {
  this.limit = new ReactiveVar();
  this.tags = new ReactiveVar([]);

  this.subscribe("favoriteDashboards");

  this.autorun(() => {
    dashboardFilter();
    this.limit.set(30);
  });

  this.autorun(() => {
    this.subscribe("dashboards", dashboardFilter(), this.limit.get());
  });

  Meteor.call("getDashboardTags", (err, res) => this.tags.set(res));
});

Template.dashboardList.onRendered(function() {
  var template = this;

  template.$(".ui.checkbox").checkbox();

  template.$(".ui.all.cards").visibility({
    once: false,
    observeChanges: true,
    onBottomVisible() {
      if (template.subscriptionsReady()) {
        template.$(".js-load-more").click();
      }
    }
  });
});

Template.dashboardList.helpers({
  dashboards: () => Dashboards.find(dashboardFilter(), { sort: { title: 1 } }),
  starredDashboards: () =>
    Dashboards.find({
      ...dashboardFilter(),
      _id: { $in: getStarred("dashboard", Meteor.user()) }
    }),

  tags: () => Template.instance().tags.get(),
  search: () => FlowRouter.getQueryParam("search"),
  filterOwn: () => FlowRouter.getQueryParam("filterOwn") === "true",

  tagLabelClass: tag =>
    FlowRouter.getQueryParam("tag") == tag ? "basic blue" : "basic",

  hasMore: function(items) {
    return (
      !Template.instance().subscriptionsReady() ||
      items.count() >= Template.instance().limit.get()
    );
  }
});

Template.dashboardList.events({
  "keyup input[name=search], change input[name=search]": event =>
    FlowRouter.setQueryParams({ search: event.target.value || null }),
  "change input[name=filterOwn]": event =>
    FlowRouter.setQueryParams({ filterOwn: event.target.checked || null }),
  "click .js-select-tag": (event, template) =>
    FlowRouter.setQueryParams({ tag: event.target.dataset.value || null }),
  "click .js-load-more": (event, template) =>
    template.limit.set(template.limit.get() + 10)
});

Template.dashboardListItem.helpers({
  hasStarred: dashboard => hasStarred("dashboard", dashboard._id)
});
