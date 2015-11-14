Template.dashboardForm.onCreated(function() {
  this.subscribe('dashboards');
});


Template.dashboardForm.onRendered(function() {
  this.$('form').form({});

  var grid = this.$('.gridster').gridster({
    widget_selector: '.item',
    widget_margins: [10, 10],
    widget_base_dimensions: [100, 100],
    resize: {
      enabled: true,
      stop: function() {
        window.dispatchEvent(new Event('resize'));
      }
    }
  }).data('gridster');

  this.autorun(() => {
    var dashboard = Dashboards.findOne(FlowRouter.getParam('id'));
    var widgets = dashboard ? dashboard.widgets : [];

    grid.remove_all_widgets();

    _.each(widgets, (widget) => {
      addWidget(grid, widget);
    });
  });
});


Template.dashboardForm.helpers({
  doc: function() {
    return Dashboards.findOne(FlowRouter.getParam('id'));
  }
});


Template.dashboardForm.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var _id = FlowRouter.getParam('id');
    var data = $(event.target).form('get values');
    data.widgets = getGrid(template).serialize();

    _id ? Dashboards.update(_id, {$set: data}) : _id = Dashboards.insert(data);
    FlowRouter.go('dashboardEdit', {id: _id});
  },

  'click .js-add-widget': function(event, template) {
    var grid = getGrid(template);
    addWidget(grid);
  },

  'click .js-remove-widget': function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest('.dashboardFormWidget');

    grid.remove_widget(widgetNode);
  }
});


function getGrid(template) {
  return template.$('.gridster').gridster().data('gridster');
}

function addWidget(grid, options) {
  options = options || {};

  var widget = Blaze.render(Template.dashboardFormWidget, grid.$el.get(0));
  var widgetNode = widget.firstNode();

  grid.add_widget(widgetNode, options.size_x, options.size_y, options.col, options.row);
}