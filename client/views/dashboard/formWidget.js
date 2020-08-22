import CodeMirror from "codemirror";
require("codemirror/mode/markdown/markdown");

Template.dashboardFormWidget.onRendered(function () {
  this.$(".ui.settings.dropdown").dropdown();
});

Template.dashboardFormWidget.helpers({
  widgetTemplate: function () {
    switch (this.type) {
      case "text":
        return "dashboardFormTextWidget";
      case "visualization":
        return "dashboardFormVisualizationWidget";
    }
  },
});

Template.dashboardFormVisualizationWidget.onRendered(function () {
  this.$(".ui.dropdown").dropdown({ fullTextSearch: true });
  this.$(".ui.checkbox").checkbox();

  Tracker.afterFlush(() =>
    this.$(".ui.search.dropdown").dropdown("set selected", this.data.visId)
  );
});

Template.dashboardFormVisualizationWidget.helpers({
  visualizations: function () {
    return Visualizations.find(
      {},
      {
        sort: { title: 1 },
      }
    );
  },
});

Template.dashboardFormTextWidget.onRendered(function () {
  var textarea = this.find("textarea");
  var editor = CodeMirror.fromTextArea(textarea, {
    mode: "text/x-markdown",
  });
  editor.on("change", (doc) => (textarea.value = doc.getValue()));
});
