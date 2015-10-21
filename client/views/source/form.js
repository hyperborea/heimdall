Template.sourceForm.onRendered(function() {
  var form = this.$('form').form({
    fields: {
      name  : 'empty',
    },
    inline: true,
  });

  this.autorun(() => {
    var source = Sources.findOne(FlowRouter.getParam('id'));
    if (source) {
      form.form('set values', source);
    }
  });
});


Template.sourceForm.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var data = template.$('form').form('get values');
    var _id = FlowRouter.getParam('id');

    _id ? Sources.update(_id, {$set: data}) : _id = Sources.insert(data);
    FlowRouter.go('sourceEdit', {id: _id});
  },

  'click .js-delete': function() {
    if (confirm('Sure you want to delete this source?')) {
      Sources.remove(FlowRouter.getParam('id'));
      FlowRouter.go('sourceList');
    }
  }
});