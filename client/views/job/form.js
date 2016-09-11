import CodeMirror from 'codemirror';
require('codemirror/mode/sql/sql');
require('codemirror/mode/javascript/javascript');
// require('codemirror/addon/hint/show-hint');
// require('codemirror/addon/hint/sql-hint');
require('codemirror/addon/edit/closebrackets');


loadHandler(Template.jobForm);

Template.jobForm.onCreated(function() {
  this.autorun( () => this.subscribe('job', FlowRouter.getParam('id')) );

  this.unsavedChanges = new ReactiveVar(false);
});


Template.jobForm.onRendered(function() {
  var textarea = this.find('textarea');
  this.editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    lineWrapping: true,
    mode: 'text/x-sql',
    theme: 'monokai',
    autoCloseBrackets: true,
    // hint: CodeMirror.hint.sql,
  });
  this.editor.on('change', (doc) => textarea.value = doc.getValue());

  // this.editor.on("keyup", function (cm, event) {
  //   if (!cm.state.completionActive && event.keyCode != 13)
  //       CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
  // });

  this.$('.ui.single.dropdown').dropdown();
  this.$('.ui.checkbox').checkbox();
  this.$('.ui.accordion').accordion();
  this.$form = this.$('form').form({ fields : {}, inline : true });

  this.autorun(() => {
    var job = Jobs.findOne(FlowRouter.getParam('id'));
    if (job && job.query) this.editor.doc.setValue(job.query);
  });

  this.subscribe('sources', () => {
    Tracker.afterFlush(() => this.$('.source.dropdown').dropdown().find('[name=sourceId]').trigger('change'));
  });
});


Template.jobForm.helpers({
  doc: () => Jobs.findOne(FlowRouter.getParam('id')),
  sources: () => Sources.find(),
  saveBtnClass: () => Template.instance().unsavedChanges.get() ? 'positive' : 'disabled',
  paramArray: (params) => params && _.map(params, (v, k) => Object({ name: k, value: v })),
  hasPermissions: function(doc) {
    return doc && (
      (doc.ownerGroups && doc.ownerGroups.length) ||
      (doc.accessGroups && doc.accessGroups.length)
    );
  },
});


Template.jobForm.events({
  'change input, keyup input, keyup textarea': function(event, template) {
    template.unsavedChanges.set(true);
  },

  'change input[name=sourceId]': function(event, template) {
    var source = Sources.findOne(event.target.value);

    if (source) {
      var config = SOURCE_TYPES[source.type];
      template.editor.setOption('mode', config.mime);
    }
  },

  'submit form': function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();

    var validation = Jobs.simpleSchema().namedContext();
    var identify = (error) => error.name.split('.').reduce((prev, cur, i) => prev + '[' + cur + ']');
    validation.validationErrors().forEach((error) => template.$form.form('remove prompt', identify(error)));

    Meteor.call('saveJob', data, function(err, jobId) {
      if (err) {
        template.$form.form('refresh').form('set error');
        validation.validationErrors().forEach((error) => {
          template.$form.form('add prompt', identify(error), validation.keyErrorMessage(error.name));
        });
      }
      else {
        template.$form.form('set success');
        template.unsavedChanges.set(false);
        FlowRouter.go('jobEdit', {id: jobId});
      }
    });
  },

  'click .js-query': function(event, template) {
    Meteor.call('runJob', FlowRouter.getParam('id'));
  },

  'click .js-cancel': function(event, template) {
    Meteor.call('cancelJob', FlowRouter.getParam('id'));
  },

  'click .js-delete': function() {
    confirmModal('Sure you want to delete this job?', function() {
      Meteor.call('removeJob', FlowRouter.getParam('id'));
      FlowRouter.go('jobList');
    });
  },

  'click .js-add-visualization': function() {
    Meteor.call('addVisualization', FlowRouter.getParam('id'), function(err, visId) {
      FlowRouter.go('visualizationEdit', {id: visId});
    });
  }
});