Template.dropdown.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});

Template.dropdown.helpers({
  defaultText: () => Template.currentData().placeholder || 'select'
});