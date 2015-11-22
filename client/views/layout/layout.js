Template.layout.onRendered(function() {
  this.$('.main.menu .ui.dropdown').dropdown({
    on: 'hover'
  });

  this.$('.ui.disclaimer.modal').modal({
    blurring: true
  });
});


Template.layout.helpers({
  userInitials: function() {
    var user = Meteor.user();
    return user && user.displayName.replace(/[^A-Z]/g, '');
  },

  isLoading: function() {
    return Session.get('isLoading');
  }
});


Template.layout.events({
  'click .js-open-disclaimer': function(event, template) {
    $('.ui.disclaimer.modal').modal('show');
  }
});