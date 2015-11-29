Template.jobForm.onCreated(function() {
  this.autorun( () => this.subscribe('job', FlowRouter.getParam('id')) );

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

  this.autorun(() => {
    var job = Jobs.findOne(FlowRouter.getParam('id'));
    if (job) {
      if (job.query) editor.doc.setValue(job.query);
      
      if (!isOwner(Meteor.user(), job)) {
        form.find('input').attr('readonly', '');
        form.find('.action.field').hide();
      }
    }
  });

  this.subscribe('sources', () => {
    Tracker.afterFlush(() => {
      this.$('.source.dropdown').dropdown();
    });
  });
});


Template.jobForm.helpers({
  doc: function() {
    var job = Jobs.findOne(FlowRouter.getParam('id'))
    return job;
  },

  sources: function() {
    return Sources.find();
  },

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

  'submit form': function(event, template) {
    event.preventDefault();

    var template = Template.instance();
    var data = $(event.target).form('get values');
    data['email.enabled'] = data['email.enabled'] === 'on';
    data['accessGroups'] = _.without( (data['accessGroups'] || '').split(','), '');
    data['ownerGroups'] = _.without( (data['ownerGroups'] || '').split(','), '');

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