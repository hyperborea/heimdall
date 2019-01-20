Template.dashboardForm.onCreated(function() {
  this.unsavedChanges = new ReactiveVar(false);
  this.includeNonOwned = new ReactiveVar(false);
  this.visSearch = new ReactiveVar("");

  this.autorun(() => {
    this.subHandle = this.subscribe("dashboardForm", FlowRouter.getParam("id"));
  });
  this.autorun(() =>
    this.subscribe(
      "visualizationsDropdown",
      this.includeNonOwned.get(),
      this.visSearch.get()
    )
  );
});

Template.dashboardForm.onRendered(function() {
  this.$("form").form({
    fields: { title: "empty" },
    inline: true
  });

  this.$(".ui.checkbox").checkbox();

  var grid = this.$(".gridster")
    .gridster({
      widget_margins: [10, 10],
      widget_base_dimensions: [80, 60],
      // tricking gridster to autogenerate css for columns generously
      min_cols: 25,
      max_size_x: 20,
      resize: {
        enabled: true,
        stop: () => this.unsavedChanges.set(true)
      },
      draggable: {
        stop: () => this.unsavedChanges.set(true)
      },
      serialize_params: function($w, wgd) {
        var type = $w.find("[name=type]").val();
        var options = {
          col: wgd.col,
          row: wgd.row,
          size_x: wgd.size_x,
          size_y: wgd.size_y,
          type: type
        };

        if (options.type === "visualization") {
          options.visId = $w.find("[name=visId]").val();
          options.basic = $w.find("[name=basic]").is(":checked");
        }
        if (options.type === "text") {
          options.text = $w.find("[name=text]").val();
        }

        return options;
      }
    })
    .data("gridster");

  this.autorun(() => {
    if (this.subHandle.ready()) {
      var dashboard = Dashboards.findOne(FlowRouter.getParam("id"));
      var widgets = dashboard ? dashboard.widgets : [];

      // Gridster tries to be clever and pushes widgets down if they don't fit in width.
      // That's not what we want though, so we're manually overriding the columns with the maximum to expect.
      grid.options.min_cols = _.max(_.map(widgets, w => w.col + w.size_x));

      grid.remove_all_widgets();
      _.each(widgets, widget => addWidget(grid, widget));
    }
  });
});

Template.dashboardForm.helpers({
  dashboard: () => Dashboards.findOne(FlowRouter.getParam("id")),
  disabledIfNew: () => !FlowRouter.getParam("id") && "disabled",
  disabledIfSaved: () => !Template.instance().unsavedChanges.get() && "disabled"
});

Template.dashboardForm.events({
  "change input, keyup input, keyup textarea": function() {
    Template.instance().unsavedChanges.set(true);
  },

  "submit form": function(event, template) {
    event.preventDefault();

    var _id = FlowRouter.getParam("id");
    var data = $(event.target).serializeJSON();
    data.widgets = getGrid(template).serialize();

    Meteor.call("saveDashboard", data, function(err, _id) {
      template.unsavedChanges.set(false);
      FlowRouter.go("dashboardEdit", { id: _id });
    });
  },

  "keyup .visualization.dropdown input.search": function(event, template) {
    template.visSearch.set(event.target.value);
  },

  "click .js-delete": function() {
    confirmModal("Sure you want to delete this dashboard?", function() {
      Meteor.call("removeDashboard", FlowRouter.getParam("id"));
      FlowRouter.go("dashboardList");
    });
  },

  "click .js-add-vis-widget": function(event, template) {
    var grid = getGrid(template);
    addWidget(grid, { size_x: 10, size_y: 4, type: "visualization" });
    template.unsavedChanges.set(true);
  },

  "click .js-add-text-widget": function(event, template) {
    var grid = getGrid(template);
    addWidget(grid, { size_x: 10, size_y: 1, type: "text" });
    template.unsavedChanges.set(true);
  },

  "click .js-move-widget-top": function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest(".dashboardFormWidget");

    grid.empty_cells(1, 1, widgetNode.data("sizex"), widgetNode.data("sizey"));
    grid.move_widget_to(widgetNode, 1, 1);
    grid.remove_empty_cells();
    template.unsavedChanges.set(true);
  },

  "click .js-clone-widget": function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest(".dashboardFormWidget");

    var options = grid.serialize(widgetNode)[0];
    options.row = options.row + options.size_y;
    addWidget(grid, options);
    template.unsavedChanges.set(true);
  },

  "click .js-remove-widget": function(event, template) {
    var grid = getGrid(template);
    var widgetNode = $(event.target).closest(".dashboardFormWidget");

    grid.remove_widget(widgetNode);
    template.unsavedChanges.set(true);
  },

  'change input[name="includeNonOwned:skip"]': function(event, template) {
    template.includeNonOwned.set(event.target.checked);
  }
});

function getGrid(template) {
  return template.$(".gridster").data("gridster");
}

function addWidget(grid, options) {
  options = options || {};

  var widget = Blaze.renderWithData(
    Template.dashboardFormWidget,
    options,
    grid.$el.get(0)
  );
  var widgetNode = widget.firstNode();

  grid.add_widget(
    widgetNode,
    options.size_x,
    options.size_y,
    options.col,
    options.row
  );
}
