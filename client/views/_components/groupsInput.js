Template.groupsInput.onCreated(function() {
  this.searchString = new ReactiveVar();
});


Template.groupsInput.onRendered(function() {
  this.$('.ui.dropdown').dropdown({ allowAdditions: true });

  this.autorun(() => {
    this.subscribe('groups', this.searchString.get(), () => {
      Tracker.afterFlush(() => {
        this.$('.ui.dropdown').dropdown('refresh');
      });
    });
  });
});


Template.groupsInput.helpers({
  groups: () => Groups.find()
});


Template.groupsInput.events({
  'keyup input': function(event, template) {
    template.searchString.set(event.target.value);
  }
});