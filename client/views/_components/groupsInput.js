Template.groupsInput.onRendered(function() {
  this.subscribe('groups', () => {
    Tracker.afterFlush(() => {
      this.$('.ui.dropdown').dropdown();
    });
  });
});


Template.groupsInput.helpers({
  groups: () => Groups.find()
});