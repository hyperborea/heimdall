Template.dropdown.onRendered(function() {  
  this.autorun(() => {
    Template.currentData();
    Tracker.afterFlush(() => {
      this.$('.ui.dropdown').dropdown()
    });
  });
});

Template.dropdown.helpers({
  defaultText: () => Template.currentData().placeholder || 'select',
  multiple: () => Template.currentData().multiple && 'multiple',

  valueOf: (item) => _.isObject(item) ? item.value : item,
  textOf: (item) => _.isObject(item) ? item.text : item,
});