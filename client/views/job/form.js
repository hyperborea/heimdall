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


Template.jobForm.onRendered(function() {
  var textarea = this.find('textarea');
  var editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: 'text/x-mysql',
    theme: 'monokai'
  });
  editor.on('change', (doc) => textarea.value = doc.getValue());

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
    }
  });
});


Template.jobForm.events({
  'submit form': function(event, template) {
    event.preventDefault();
    
    var data = template.$('form').form('get values');
    var _id = FlowRouter.getParam('id');

    _id ? Jobs.update(_id, {$set: data}) : _id = Jobs.insert(data);
    FlowRouter.go('jobView', {id: _id});
  },

  'click .js-delete': function() {
    Jobs.remove(FlowRouter.getParam('id'));
    FlowRouter.go('jobList');
  }
});