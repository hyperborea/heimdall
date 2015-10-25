function fieldRules(fields) {
  _.each(fields, function(rules, key) {
    if(typeof rules == 'string') {
      rules = [rules];
    }

    fields[key] = {
      identifier: key,
      rules: _.map(rules, (rule) => Object({ type: rule }))
    }
  });

  return fields;
}


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

  this.$('select, .ui.dropdown').dropdown();
  this.$('.ui.accordion').accordion();

  var form = this.$('form').form({
    fields : fieldRules({
      name  : 'empty',
      query : 'empty',
    }),
    inline  : true,
  });

  this.autorun(() => {
    var job = Jobs.findOne(FlowRouter.getParam('id'));
    if (job) {
      form.form('set values', job);
      editor.doc.setValue(job.query);
      Template.instance().unsavedChanges.set(false);
    }
  });
});


Template.jobForm.helpers({
  sources: function() {
    return Sources.find();
  },

  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'positive' : 'disabled';
  }
});


Template.jobForm.events({
  'change input, change textarea, keyup input': function() {
    Template.instance().unsavedChanges.set(true);
  },

  'submit form': function(event, template) {
    event.preventDefault();

    var data = template.$('form').form('get values');
    var _id = FlowRouter.getParam('id');

    _id ? Jobs.update(_id, {$set: data}) : _id = Jobs.insert(data);
    Template.instance().unsavedChanges.set(false);
    FlowRouter.go('jobEdit', {id: _id});
  },

  'click .js-query': function(event, template) {
    Meteor.call('query', FlowRouter.getParam('id'));
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this job?')) {
      Jobs.remove(FlowRouter.getParam('id'));
      FlowRouter.go('jobList');
    }
  }
});