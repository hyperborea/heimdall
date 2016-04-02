const PASSWORD_NOCHANGE = '_PASSWORD_NOCHANGE_';


Template.sourceForm.onCreated(function() {
  this.unsavedChanges = new ReactiveVar(false);
});


Template.sourceForm.onRendered(function() {
  var form = this.$('form').form({
    fields : {
      name     : 'empty',
      type     : 'empty',
      host     : 'empty',
      username : 'empty'
    },
    inline: true,
  });

  this.$('.ui.checkbox').checkbox();
});


Template.sourceForm.helpers({
  sourceTypes: () => _.values(SOURCE_TYPES),

  doc: function() {
    var source = Sources.findOne(FlowRouter.getParam('id')) || {
      type: 'postgres'
    };
    
    return _.extend(source, {
      password: PASSWORD_NOCHANGE,
    });
  },

  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'positive' : 'disabled';
  },

  resultIcon: function(result) {
    switch (result.status) {
      case 'ok': return 'green check circle';
      case 'running': return 'loading spinner';
      case 'error': return 'red remove circle';
    }
  },

  resultIsError: function(result) {
    return result.status === 'error';
  }
});


Template.sourceForm.events({
  'change input, keyup input': function(event, template) {
    template.unsavedChanges.set(true);
  },

  'submit form': function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    if (data.password == PASSWORD_NOCHANGE) delete data.password;

    Meteor.call('saveSource', data, function(err, _id) {
      template.unsavedChanges.set(false);
      FlowRouter.go('sourceEdit', {id: _id});
    });
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this source?')) {
      Meteor.call('removeSource', FlowRouter.getParam('id'));
      FlowRouter.go('sourceList');
    }
  },

  'click .js-test': function() {
    Meteor.call('testSource', FlowRouter.getParam('id'));
  }
});