isFullscreen = function() {
  return FlowRouter.getQueryParam('fullscreen') === 'true';
};
Template.registerHelper('isFullscreen', isFullscreen);


render = function(templateName) {
  return function(params, queryParams) {
    var layout = isFullscreen() ? 'layoutBasic' : 'layout';
    BlazeLayout.render(layout, {template: templateName, data: params});
  }
};


loadHandler = function(TemplateClass) {
  TemplateClass.onCreated(function() {
    this.autorun( () => Session.set('isLoading', this.subscriptionsReady() === false) );
  });

  TemplateClass.onDestroyed(function() {
    Session.set('isLoading', false);
  });
};