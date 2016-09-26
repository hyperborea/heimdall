import 'c3/c3.min.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/addon/hint/show-hint.css';


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

  isLoading: () => Session.get('isLoading'),
  mayAdmin: () => mayAdmin(Meteor.user()),
});


Template.layout.events({
  'click .js-toggle-admin': function(event, template) {
    Meteor.users.update(Meteor.userId(), {
      $set: { 'profile.adminEnabled': !Meteor.user().profile.adminEnabled }
    });
    location.reload();
  }
});


confirmModal = function(text, options) {
  if (_.isFunction(options))
    options = { onApprove: options };

  $('.confirm.modal')
    .modal(options).modal('show')
    .find('.content')
      .html(text);
}