Template.dashboardFormWidget.onCreated(function() {
  this.subscribe('visualizations');
});


Template.dashboardFormWidget.onRendered(function() {
  this.$('.ui.dropdown').dropdown({
    fullTextSearch: true
  });

  this.autorun(() => {
    Jobs.find().fetch(); // rerun reactively
    this.$('.ui.dropdown').dropdown('set selected', this.data.visId);  
  });
});


Template.dashboardFormWidget.helpers({
  visualizations: function() {
    return Visualizations.find({}, {
      sort: { title: 1 }
    });
  }
});