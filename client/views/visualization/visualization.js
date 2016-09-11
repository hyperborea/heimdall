Template.visualization.onCreated(function() {
  this.rendered = new ReactiveVar(false);

  this.id = () => Template.currentData().id;
  this.vis = () => _.extend(Visualizations.findOne(this.id()) || {}, Template.currentData());
  this.result = () => _.result(this.vis(), 'result');

  this.autorun(() =>  {
    if (this.id()) {
      const context = Template.currentData();
      const job = Jobs.findOne(this.vis().jobId);
      let parameters = context.parameters;
      
      if (job) {
        parameters = cleanParameters(parameters, job.parameters);
      }

      this.subscribe('visualization', this.id(), parameters, context.dashboardId);  
    }
  });
});

Template.visualization.onRendered(function() {
  this.rendered.set(true);
});


Template.visualization.helpers({
  vis: () => Template.instance().vis(),
  loading: () => !Template.instance().subscriptionsReady() && 'loading',

  templateName: function() {
    const template = Template.instance();
    
    if (template.subscriptionsReady()) {
      const vis = template.vis();
      const result = template.result();

      if (result) {
        if (result.status === 'error')
          return 'visualizationError';
        else if (_.isArray(result.data))
          return 'vis' + (vis.type || 'DataTable');
        else if (result.status === 'running')
          return 'visualizationRunning'
      }
    }
  },

  running: function() {
    const result = Template.instance().result();
    return (result && result.status === 'running') && 'loading';
  },

  data: function() {
    var template = Template.instance();
    var settings = _.clone(template.vis());

    if (template.rendered.get()) {
      var wrapper = template.find('.visualizationWrapper');
      var topbar = template.find('.visualizationTopbar');
      var canvas = template.find('.visualizationCanvas');

      const canvasHeight = wrapper.offsetHeight - (topbar ? topbar.offsetHeight : 0) - 28;
      if (canvasHeight) $(canvas).height(canvasHeight);

      settings.height = canvasHeight;
      settings.width = canvas.offsetWidth;
    }

    return _.extend(_.clone(template.result()) || {}, {
      settings: settings
    });
  }
});


Template.visualization.events({
  'click .js-run': function(event, template) {
    const vis = template.vis();
    Meteor.call('runJob', vis.jobId, vis.parameters);
  },

  'click .js-download': function(event, template) {
    const csv = Papa.unparse(template.result().data, { delimiter: ';' });
    const blob = new Blob([csv], {type: "application/csv"});
    saveAs(blob, `${template.vis().jobName}.csv`);
  }
});