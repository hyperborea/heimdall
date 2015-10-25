const PASSWORD_NOCHANGE = '_PASSWORD_NOCHANGE_';


Template.sourceForm.onCreated(function() {
  this.unsavedChanges = new ReactiveVar(false);
});


Template.sourceForm.onRendered(function() {
  var form = this.$('form').form({
    fields: {
      name: 'empty',
    },
    inline: true,
  });

  this.autorun(() => {
    var source = Sources.findOne(FlowRouter.getParam('id'));
    if (source) {
      source.password = PASSWORD_NOCHANGE;
      form.form('set values', source);
    }
  });
});


Template.sourceForm.helpers({
  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'orange' : 'disabled';
  }
});


Template.sourceForm.events({
  'change input, keyup input': function() {
    Template.instance().unsavedChanges.set(true);
  },

  'submit form': function(event, template) {
    event.preventDefault();

    var _id = FlowRouter.getParam('id');
    var data = template.$('form').form('get values');
    if (data.password == PASSWORD_NOCHANGE) delete data.password;

    _id ? Sources.update(_id, {$set: data}) : _id = Sources.insert(data);
    Template.instance().unsavedChanges.set(false);
    FlowRouter.go('sourceEdit', {id: _id});
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this source?')) {
      Sources.remove(FlowRouter.getParam('id'));
      FlowRouter.go('sourceList');
    }
  }
});