isFullscreen = () => FlowRouter.getQueryParam("fullscreen") === "true";
Template.registerHelper(
  "isFullscreen",
  (valueIfTrue = true) => isFullscreen() && valueIfTrue
);
Template.registerHelper(
  "isNotFullscreen",
  (valueIfTrue = true) => !isFullscreen() && valueIfTrue
);

render = function (templateName) {
  return function (params, queryParams) {
    BlazeLayout.render("layout", { template: templateName, data: params });
  };
};

loadHandler = function (TemplateClass) {
  TemplateClass.onCreated(function () {
    this.autorun(() =>
      Session.set("isLoading", this.subscriptionsReady() === false)
    );
  });

  TemplateClass.onDestroyed(function () {
    Session.set("isLoading", false);
  });
};
