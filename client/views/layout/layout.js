Template.layout.onRendered(function() {
  this.$('.main.menu .ui.dropdown').dropdown({
    on: 'hover'
  });
});


Template.layout.helpers({
  userInitials: function() {
    var user = Meteor.user();
    return user && user.displayName.replace(/[^A-Z]/g, '');
  }
});