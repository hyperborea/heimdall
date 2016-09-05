import CodeMirror from 'codemirror';
require('codemirror/mode/sql/sql');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/sql-hint');
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
    mode: 'text/x-sql',
    theme: 'monokai',
    // extraKeys: {"Ctrl-Space": "autocomplete"},
    autoCloseBrackets: true,
    hint: CodeMirror.hint.sql,
  });
  this.editor.on('change', (doc) => textarea.value = doc.getValue());

  this.editor.on("keyup", function (cm, event) {
    if (!cm.state.completionActive && event.keyCode != 13)
        CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
  });

  this.$('.ui.single.dropdown').dropdown();
  this.$('.ui.checkbox').checkbox();
  this.$('.ui.accordion').accordion();

  var form = this.$('form').form({
    fields : {
      name     : 'empty',
      query    : 'empty',
      sourceId : 'empty',
    },
    inline  : true,
  });

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

  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'positive' : 'disabled';
  },

  hasPermissions: function(doc) {
    return doc && (
      (doc.ownerGroups && doc.ownerGroups.length) ||
      (doc.accessGroups && doc.accessGroups.length)
    );
  }
});


Template.jobForm.events({
  'change input, keyup input, keyup textarea': function() {
    Template.instance().unsavedChanges.set(true);
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

    var template = Template.instance();
    var data = $(event.target).serializeJSON();

    Meteor.call('saveJob', data, function(err, _id) {
      template.unsavedChanges.set(false);
      FlowRouter.go('jobEdit', {id: _id});
    });
  },

  'click .js-query': function(event, template) {
    Meteor.call('runJob', FlowRouter.getParam('id'));
  },

  'click .js-cancel': function(event, template) {
    Meteor.call('cancelJob', FlowRouter.getParam('id'));
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this job?')) {
      Meteor.call('removeJob', FlowRouter.getParam('id'));
      FlowRouter.go('jobList');
    }
  },

  'click .js-add-visualization': function() {
    Meteor.call('addVisualization', FlowRouter.getParam('id'), function(err, _id) {
      FlowRouter.go('visualizationEdit', {id: _id});
    });
  }
});