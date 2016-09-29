Template.login.onCreated(function() {
  this.error = new ReactiveVar(false);
});


Template.login.helpers({
  loading: () => Meteor.loggingIn() && 'loading',
  hasError: () => Template.instance().error.get() ? 'error' : false,
  errorMessage: () => Template.instance().error.get(),
  configuredServices: () => _.pluck(Accounts.loginServiceConfiguration.find().fetch(), "service"),
  isEnabled: (service) => Accounts.loginServiceConfiguration.findOne({ service: service }),
});


Template.login.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var username = template.find('[name=username]').value;
    var password = template.find('[name=password]').value;

    Meteor.loginWithPassword(username, password, function(err) {
      if (err) {
        if (Meteor.settings.public.ldapEnabled) {
          Meteor.loginWithLDAP(username, password, function(err) {
            if (err) template.error.set(err.reason);
          });  
        }
        else {
          template.error.set(err.reason);
        }
      }
    });
  },

  'click .google.button': function(event, template) {
    Meteor.loginWithGoogle({}, function(err) {
      if (err) template.error.set(err.reason);
    });
  },

  'click .github.button': function(event, template) {
    Meteor.loginWithGithub({}, function(err) {
      if (err) template.error.set(err.reason);
    });
  },

  'click .facebook.button': function(event, template) {
    Meteor.loginWithFacebook({}, function(err) {
      if (err) template.error.set(err.reason);
    });
  }
});