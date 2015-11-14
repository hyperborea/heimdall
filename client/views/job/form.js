Template.jobForm.onCreated(function() {
  this.subscribe('jobs');
  this.subscribe('sources');

  this.unsavedChanges = new ReactiveVar(false);
});


Template.jobForm.onRendered(function() {
  var textarea = this.find('textarea');
  var editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: 'text/x-mysql',
    theme: 'monokai'
  });
  editor.on('change', (doc) => textarea.value = doc.getValue());

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

  // on hot reload we might need to set the values again
  this.autorun(() => {
    var _id = FlowRouter.getParam('id');

    if (_id && form.form('get value', '_id') != _id) {
      if (job = Jobs.findOne(_id)) {
        // the timeout ensures that the source select box is populated before setting the values
        Meteor.setTimeout(() => {
          form.form('set values', objectToDotNotation(job));
          editor.doc.setValue(job.query);
          this.unsavedChanges.set(false);
        });
      }
    }
  });
});


Template.jobForm.helpers({
  doc: function() {
    return Jobs.findOne(FlowRouter.getParam('id'));
  },

  sources: function() {
    return Sources.find();
  },

  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'positive' : 'disabled';
  }
});


Template.jobForm.events({
  'change input, keyup input, keyup textarea': function() {
    Template.instance().unsavedChanges.set(true);
  },

  'submit form': function(event, template) {
    event.preventDefault();

    var template = Template.instance();
    var data = $(event.target).form('get values');
    data['email.enabled'] = data['email.enabled'] === 'on';

    Meteor.call('saveJob', data, function(err, _id) {
      template.unsavedChanges.set(false);
      FlowRouter.go('jobEdit', {id: _id});
    });
  },

  'click .js-query': function(event, template) {
    Meteor.call('runJob', FlowRouter.getParam('id'));
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this job?')) {
      Meteor.call('removeJob', FlowRouter.getParam('id'));
      FlowRouter.go('jobList');
    }
  }
});