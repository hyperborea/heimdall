Template.groupsInput.onCreated(function () {
  this.search = new ReactiveVar();

  this.autorun(() => {
    this.subscribe("groups", this.search.get());
  });
});

Template.groupsInput.onRendered(function () {
  this.autorun(() => {
    Template.currentData();

    this.$(".ui.dropdown").dropdown({
      allowAdditions: true,
      fullTextSearch: true,
    });
  });
});

Template.groupsInput.helpers({
  groups: () => Groups.find(),
});

Template.groupsInput.events({
  "keyup input.search": function (event, template) {
    template.search.set(event.target.value);
  },
});
