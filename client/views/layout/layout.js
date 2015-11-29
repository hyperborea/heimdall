Template.layout.onRendered(function() {
  this.$('.ui.disclaimer.modal').modal({
    blurring: true
  });

  var grid = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  var canvas = this.find('#logo');
  var ether = new Ethergrid(canvas, grid, { entropy: 0 });

  this.autorun(() => {
    ether.speed(Session.get('isLoading') ? 0.35 : 0.5);
    ether.entropy(Session.get('isLoading') ? 10 : 0);
    Session.get('isLoading') ? ether.color(255, 0, 0, 0.5) : ether.color(247, 202, 24, 0.5);
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