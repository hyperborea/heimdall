Template.dashboardFormWidget.onRendered(function() {
  this.$('.ui.settings.dropdown').dropdown();
});

Template.dashboardFormWidget.helpers({
  widgetTemplate: function() {
    switch (this.type) {
      case 'text': return 'dashboardFormTextWidget';
      case 'visualization': return 'dashboardFormVisualizationWidget';
    }
  }
});


Template.dashboardFormVisualizationWidget.onCreated(function() {
  this.subscribe('visualizations');
});

Template.dashboardFormVisualizationWidget.onRendered(function() {
  this.$('.ui.dropdown').dropdown({ fullTextSearch: true });

  this.autorun(() => {
    Jobs.find().fetch(); // rerun reactively
    this.$('.ui.search.dropdown').dropdown('set selected', this.data.visId);  
  });
});

Template.dashboardFormVisualizationWidget.helpers({
  visualizations: function() {
    return Visualizations.find({}, {
      sort: { title: 1 }
    });
  }
});


Template.dashboardFormTextWidget.onRendered(function() {
  var textarea = this.find('textarea');
  // var editor = new MediumEditor(textarea);
  var editor = CodeMirror.fromTextArea(textarea, {
    mode: 'text/x-markdown',
  });
  editor.on('change', (doc) => textarea.value = doc.getValue());
});