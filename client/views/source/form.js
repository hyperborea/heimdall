const PASSWORD_NOCHANGE = '_PASSWORD_NOCHANGE_';


Template.sourceForm.onCreated(function() {
  this.unsavedChanges = new ReactiveVar(false);
});


Template.sourceForm.onRendered(function() {
  var form = this.$('form').form({
    inline: true,
  });

  this.$('.ui.checkbox').checkbox();

  this.autorun(() => {
    if (source = Sources.findOne(FlowRouter.getParam('id'))) {
      source.password = PASSWORD_NOCHANGE;
      form.form('set values', source);
      this.unsavedChanges.set(false);

      if (!isOwner(Meteor.userId(), source.ownerId)) {
        form.find('input').attr('readonly', '');
        form.find('.action.field').hide();
      }
    }
  });
});


Template.sourceForm.helpers({
  saveBtnClass: function() {
    return Template.instance().unsavedChanges.get() ? 'positive' : 'disabled';
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
    data['isPublic'] = data['isPublic'] === 'on';

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