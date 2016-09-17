Template.login.onCreated(function() {
  this.error = new ReactiveVar(false);
});


Template.login.helpers({
  loading: () => Meteor.loggingIn() && 'loading',
  hasError: () => Template.instance().error.get() ? 'error' : false,
  errorMessage: () => Template.instance().error.get()
});


Template.login.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var username = template.find('[name=username]').value;
    var password = template.find('[name=password]').value;

    Meteor.loginWithLDAP(username, password, function(err) {
      if (err) template.error.set(err.reason);
    });
  }
});