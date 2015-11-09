Template.dashboard.onCreated(function() {
  this.subscribe('jobs');
});


Template.dashboard.onRendered(function() {
  this.$('.gridster').gridster({
    widget_selector: '.item',
    widget_margins: [0, 0],
    widget_base_dimensions: [200, 140],
    max_cols: 6,
    resize: {
      enabled: true
    }
  });
});


Template.dashboard.events({
  'click .button': function(event, template) {
    var grid = template.$('.gridster').gridster().data('gridster');
    var gridNode = template.find('.gridster');

    var job = Jobs.findOne('7i95baedLwwajxW5k');
    var widgetTemplate = Template['vis' + job.vis.type];
    // var widget = Blaze.renderWithData(widgetTemplate, job.result, gridNode);

    var widget = Blaze.render(Template.dashboardWidget, gridNode);
    var widgetNode = widget.firstNode();
    console.log(widgetNode);

    grid.add_widget(widgetNode);
  }
});


Template.dashboardWidget.helpers({
  foo: 'hello world'
});