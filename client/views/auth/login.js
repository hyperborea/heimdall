Template.login.helpers({
  loading: function() {
    return Meteor.loggingIn() && 'loading';
  }
});


Template.login.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var username = template.find('[name=username]').value;
    var password = template.find('[name=password]').value;

    Meteor.loginWithLDAP(username, password, function(err) {
      if (err) alert('Authentication failed, please try again');
    });
  }
});