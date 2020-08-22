loadHandler(Template.alarmList);

Template.alarmList.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault("limit", 10);

  this.autorun(() => {
    this.subscribe("jobAlarms", this.state.all());
  });
});

Template.alarmList.onRendered(function () {
  var template = this;

  template.$("input[name=showAck]").checkbox();

  template.$(".ui.feed").visibility({
    once: false,
    observeChanges: true,
    onBottomVisible() {
      if (template.subscriptionsReady()) {
        template.$(".js-load-more").click();
      }
    },
  });
});

Template.alarmList.helpers({
  alarms: () => JobAlarms.find({}, { sort: { insertedAt: -1 } }),
  showAck: () => Session.get("alarms.showAck"),
  hasItems: (alarms) =>
    !Template.instance().subscriptionsReady() || alarms.count(),
  hasMore: function (items) {
    return (
      !Template.instance().subscriptionsReady() ||
      items.count() >= Template.instance().state.get("limit")
    );
  },
});

Template.alarmList.events({
  "change input[name=showAck]": (event, template) =>
    template.state.set("showAck", event.target.checked),
  "click .js-load-more": (event, template) =>
    template.state.set("limit", template.state.get("limit") + 10),
});
