Template.dashboardForm.onCreated(function() {
  this.autorun(() => {
    this.subscribe('dashboard', FlowRouter.getParam('id'));
  });
});


Template.dashboardForm.onRendered(function() {
  this.$('form').form({
    fields: {
      title: 'empty'
    },
    inline: true
  });

  var grid = this.$('.gridster').gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [80, 60],
    max_size_x: 20,
    resize: {
      enabled: true
    },
    serialize_params: function($w, wgd) {
      return {
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y,
        type: $w.find('[name=type]').val(),
        visId: $w.find('[name=visId]').val(),
        text: $w.find('[name=text]').val()
      };
    }
  }).data('gridster');

  this.autorun(() => {
    var dashboard = Dashboards.findOne(FlowRouter.getParam('id'));

    if (dashboard) {
      grid.remove_all_widgets();
      _.each(dashboard.widgets, (widget) => {
        addWidget(grid, widget);
      });
    }
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
    var data = $(event.target).serializeJSON();
    data.widgets = getGrid(template).serialize();

    _id ? Dashboards.update(_id, {$set: data}) : _id = Dashboards.insert(data);
    FlowRouter.go('dashboardEdit', {id: _id});
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this dashboard?')) {
      Dashboards.remove(FlowRouter.getParam('id'));
      FlowRouter.go('dashboardList');
    }
  },

  'click .js-add-vis-widget': function(event, template) {
    var grid = getGrid(template);
    addWidget(grid, { size_x: 10, size_y: 4, type: 'visualization' });
  },

  'click .js-add-text-widget': function(event, template) {
    var grid = getGrid(template);
    addWidget(grid, { size_x: 10, size_y: 1, type: 'text' });
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

  var widget = Blaze.renderWithData(Template.dashboardFormWidget, options, grid.$el.get(0));
  var widgetNode = widget.firstNode();

  grid.add_widget(widgetNode, options.size_x, options.size_y, options.col, options.row);
}