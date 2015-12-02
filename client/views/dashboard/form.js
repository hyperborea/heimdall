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
    widget_margins: [10, 20],
    widget_base_dimensions: [200, 150],
    max_size_x: 10,
    resize: {
      enabled: true
    },
    serialize_params: function($w, wgd) {
      return {
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y,
        jobId: $w.find('[name=jobId]').val()
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
    var data = $(event.target).form('get values');
    data['accessGroups'] = _.without( (data['accessGroups'] || '').split(','), '');
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

  'click .js-add-widget': function(event, template) {
    var grid = getGrid(template);
    addWidget(grid, { size_x: 5, size_y: 2 });
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