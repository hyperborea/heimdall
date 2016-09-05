const PASSWORD_NOCHANGE = '_PASSWORD_NOCHANGE_';


Template.sourceForm.onCreated(function() {
  this.unsavedChanges = new ReactiveVar(false);
  this.sourceTypeConfig = new ReactiveVar({});

  this.autorun( () => this.subscribe('source', FlowRouter.getParam('id')) );
});


Template.sourceForm.onRendered(function() {
  var form = this.$('form').form({
    fields : {
      name     : 'empty',
      type     : 'empty',
    },
    inline: true,
  });

  this.$('.ui.checkbox').checkbox();
});


Template.sourceForm.helpers({
  sourceTypes: () => _.values(SOURCE_TYPES),

  source: function() {
    var source = Sources.findOne(FlowRouter.getParam('id')) || {};

    if (source.type) {
      Template.instance().sourceTypeConfig.set(SOURCE_TYPES[source.type]);  
    }
    
    return _.extend(source, {
      password: PASSWORD_NOCHANGE,
    });
  },

  showField: function(field) {
    var config = Template.instance().sourceTypeConfig.get();
    return config && _.contains(config.fields, field);
  },

  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'positive' : 'disabled';
  },

  statusIcon: function(status) {
    switch (status) {
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

  'change input[name=type]': function(event, template) {
    template.sourceTypeConfig.set(SOURCE_TYPES[event.target.value]);
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
    confirmModal('Sure you want to delete this source?', function() {
      Meteor.call('removeSource', FlowRouter.getParam('id'));
      FlowRouter.go('sourceList');
    });
  },

  'click .js-test': function() {
    Meteor.call('testSource', FlowRouter.getParam('id'));
  }
});