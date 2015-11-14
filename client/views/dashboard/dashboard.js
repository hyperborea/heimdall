Template.dashboard.onCreated(function() {
  this.subscribe('jobs');
});


Template.dashboard.onRendered(function() {
  this.$('.gridster').gridster({
    widget_selector: '.item',
    widget_margins: [0, 0],
    widget_base_dimensions: [100, 100],
    resize: {
      enabled: true,
      stop: function() {
        window.dispatchEvent(new Event('resize'));
      }
    }
  });
});


Template.dashboard.events({
  'click .button': function(event, template) {
    var grid = template.$('.gridster').gridster().data('gridster');
    var gridNode = template.find('.gridster');

    var job = Jobs.findOne('7i95baedLwwajxW5k');
    var widget = Blaze.renderWithData(Template.visualization, job, gridNode);
    // var widget = Blaze.render(Template.dashboardWidget, gridNode);
    var widgetNode = widget.firstNode();

    grid.add_widget(widgetNode, 7, 3);
  }
});


Template.dashboardWidget.helpers({
  foo: 'hello world'
});