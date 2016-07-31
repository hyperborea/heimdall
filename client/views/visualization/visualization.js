Template.visualization.onCreated(function() {
  this.rendered = new ReactiveVar(false);
});

Template.visualization.onRendered(function() {
  this.rendered.set(true);
});


Template.visualization.helpers({
  templateName: function() {
    const template = Template.instance();
    const context = Template.currentData();
    const result = context.result;

    if (result && template.rendered.get()) {
      switch (result.status) {
        case false:
          return undefined
        case 'error':
          return 'visualizationError';
        default:
          return _.isArray(result.data) && 'vis' + (context.visType || (context.vis && context.vis.type) || 'DataTable')
      }
    }
  },

  loading: function() {
    var data = Template.currentData();
    return (data && data.result && data.result.status === 'running') ? 'loading' : false;
  },

  visData: function() {
    var template = Template.instance();
    var settings = _.clone(this.vis) || {};

    if (template.rendered.get()) {
      var wrapper = template.find('.visualizationWrapper');
      var topbar = template.find('.visualizationTopbar');
      var canvas = template.find('.visualizationCanvas');

      settings.height = wrapper.offsetHeight - (topbar ? topbar.offsetHeight : 0) - 28;
      settings.width = canvas.offsetWidth;
    }

    return _.extend(_.clone(this.result) || {}, {
      settings: settings
    });
  }
});


Template.visualization.events({
  'click .js-run': function(event, template) {
    Meteor.call('runJob', this.vis.jobId);
  },

  'click .js-download': function(event, template) {
    const job = this.vis.job();
    const csv = Papa.unparse(this.result.data, { delimiter: ';' });
    const blob = new Blob([csv], {type: "application/csv"});
    saveAs(blob, `${job.name}.csv`);
  }
});