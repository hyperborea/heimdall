Template.visualizationForm.onCreated(function() {
  this.autorun(() => {
    this.subscribe("visualization", FlowRouter.getParam("id"));
  });

  this.getId = () => FlowRouter.getParam("id");
  this.getVisualization = () => Visualizations.findOne(this.getId());
});

Template.visualizationForm.onRendered(function() {
  this.$(".ui.main.form").form({});
});

Template.visualizationForm.helpers({
  vis: () => Template.instance().getVisualization(),

  visTypes: [
    { text: "Data Table", value: "DataTable", icon: "table" },
    { text: "Line Chart", value: "Chart", icon: "line chart" },
    { text: "Big Number", value: "BigNumber", icon: "bullseye" },
    { text: "Calendar", value: "CalHeatmap", icon: "calendar alternate" },
    { text: "Geo Map", value: "GeoMap", icon: "map" },
    { text: "Progress", value: "Progress", icon: "percent" },
    { text: "Pie Chart", value: "PieChart", icon: "pie chart" },
    { text: "Word Cloud", value: "WordCloud", icon: "cloud" },
    { text: "World Map", value: "WorldMap", icon: "world" }
  ],

  typeForm: function(vis) {
    return vis && vis.type ? `vis${vis.type}Form` : null;
  },

  typeData: function(vis) {
    if (vis) {
      return {
        settings: vis.settings || {},
        fields: _.result(vis.result(), "fields")
      };
    }
  }
});

Template.visualizationForm.events({
  "change input": (event, template) => template.$("form").submit(),

  "submit .ui.form": function(event, template) {
    event.preventDefault();

    const data = $(event.target).serializeJSON();
    const coreFields = ["_id", "title", "type"];

    let doc = _.pick(data, coreFields);
    doc.settings = _.omit(data, coreFields);

    Meteor.call("saveVisualization", doc);
  },

  "click .js-delete": function(event, template) {
    const vis = template.getVisualization();

    confirmModal("Sure you want to delete this visualization?", function() {
      Meteor.call("removeVisualization", vis._id);
      FlowRouter.go("jobEdit", { id: vis.jobId });
    });
  },

  "click .js-clone": function(event, template) {
    Meteor.call("cloneVisualization", template.getId(), (err, visId) => {
      FlowRouter.go("visualizationEdit", { id: visId });
    });
  }
});
