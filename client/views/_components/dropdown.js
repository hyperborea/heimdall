// name: string
// value: string
// defaultValue: string
// placeholder: string
// items: list of strings or objects {value, text, [icon]}
// allowEmpty: bool
// multiple: bool
// allowAdditions: bool

Template.dropdown.onRendered(function() {  
  this.autorun(() => {
    var data = Template.currentData();
    Tracker.afterFlush(() => {
      this.$('.ui.dropdown').dropdown({
        allowAdditions: data.allowAdditions
      })
    });
  });
});

Template.dropdown.helpers({
  coalesce: (v1, v2) => v1 || v2,
  defaultText: () => Template.currentData().placeholder || 'select',
  multiple: () => Template.currentData().multiple && 'multiple',

  valueOf: (item) => _.isObject(item) ? item.value : item,
  textOf: (item) => _.isObject(item) ? item.text : item,
  iconOf: (item) => _.isObject(item) ? item.icon : false,
});