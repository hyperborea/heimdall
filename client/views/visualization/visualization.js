Template.visualization.helpers({
  templateName: function() {
    const context = Template.currentData();
    const result = context.result;

    if (result) {
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
    return _.extend(_.clone(this.result) || {}, {
      settings: this.vis
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