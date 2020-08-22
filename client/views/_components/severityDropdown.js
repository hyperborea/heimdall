Template.severityDropdown.onRendered(function () {
  this.$(".ui.dropdown").dropdown();
});

Template.severityDropdown.helpers({
  severities: _.values(_.sortBy(SEVERITIES, "rank").reverse()),
});
