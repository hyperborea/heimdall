Template.groupsInput.onRendered(function() {
  this.subscribe('groups', () => {
    Tracker.afterFlush(() => {
      this.$('.ui.dropdown').dropdown({ allowAdditions: true });
    });
  });
});


Template.groupsInput.helpers({
  groups: function() {
    return Groups.find();
  }
});