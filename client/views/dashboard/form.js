Template.dashboardForm.onCreated(function() {
  this.includeNonOwned = new ReactiveVar(false);

  this.autorun(() => this.subscribe('dashboardForm', FlowRouter.getParam('id')));
  this.autorun(() => this.subscribe('visualizations', this.includeNonOwned.get()));
});


Template.dashboardForm.onRendered(function() {
  this.$('form').form({
    fields: {
      title: 'empty'
    },
    inline: true
  });

  this.$('.ui.checkbox').checkbox();

  var grid = this.$('.gridster').gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [80, 60],
    max_size_x: 20,
    resize: {
      enabled: true
    },
    serialize_params: function($w, wgd) {
      var type = $w.find('[name=type]').val();
      var options = {
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y,
        type: type
      };

      if (options.type === 'visualization') {
        options.visId = $w.find('[name=visId]').val();
        options.basic = $w.find('[name=basic]').is(':checked');
      }
      if (options.type === 'text') {
        options.text = $w.find('[name=text]').val();
      }

      return options;
    }
  }).data('gridster');

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      var dashboard = Dashboards.findOne(FlowRouter.getParam('id'));

      grid.remove_all_widgets();
      _.each(dashboard && dashboard.widgets, (widget) => {
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

  'click .js-move-widget-top': function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest('.dashboardFormWidget');

    grid.empty_cells(1, 1, widgetNode.data('sizex'), widgetNode.data('sizey'));
    grid.move_widget_to(widgetNode, 1, 1);
    grid.remove_empty_cells();
  },

  'click .js-clone-widget': function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest('.dashboardFormWidget');

    var options = grid.serialize(widgetNode)[0];
    options.row = options.row + options.size_y;
    addWidget(grid, options);
  },

  'click .js-remove-widget': function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest('.dashboardFormWidget');

    grid.remove_widget(widgetNode);
  },

  'change input[name="includeNonOwned:skip"]': function(event, template) {
    template.includeNonOwned.set(event.target.checked);
  }
});


function getGrid(template) {
  return template.$('.gridster').data('gridster');
}

function addWidget(grid, options) {
  options = options || {};

  var widget = Blaze.renderWithData(Template.dashboardFormWidget, options, grid.$el.get(0));
  var widgetNode = widget.firstNode();

  grid.add_widget(widgetNode, options.size_x, options.size_y, options.col, options.row);
}