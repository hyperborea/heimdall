Template.visualizationForm.onCreated(function() {
  this.subscribe('visualization', FlowRouter.getParam('id'));
});


Template.visualizationForm.onRendered(function() {
  this.autorun(() => {
    if (this.subscriptionsReady()) this.$('.ui.dropdown').dropdown();
  });
  
  this.$('.ui.main.form').form({});
});


Template.visualizationForm.helpers({
  vis: () => Visualizations.findOne(FlowRouter.getParam('id')),

  typeForm: function(vis) {
    return (vis && vis.type) ? `vis${vis.type}Form` : null;
  },

  typeData: function(vis) {
    if (vis) {
      return {
        settings: vis.settings || {},
        fields: _.result(vis.result(), 'fields')
      };  
    }
  }
});


Template.visualizationForm.events({
  'change .autosubmit': (event, template) => template.$('form').submit(),

  'submit .ui.form': function(event, template) {
    event.preventDefault();

    const data = $(event.target).serializeJSON();
    const coreFields = ['_id', 'title', 'type'];

    let doc = _.pick(data, coreFields);
    doc.settings = _.omit(data, coreFields);

    Meteor.call('saveVisualization', doc);
  },

  'click .js-delete': function(event, template) {
    var vis = Visualizations.findOne(FlowRouter.getParam('id'));

    confirmModal('Sure you want to delete this visualization?', function() {
      Meteor.call('removeVisualization', vis._id);
      FlowRouter.go('jobEdit', { id: vis.jobId });
    });
  }
});