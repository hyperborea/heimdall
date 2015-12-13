AUTH_ROUTES = ['login', 'logout'];

// Make sure the user is logged in, otherwise redirect to login page.
Meteor.startup(function() {
  Tracker.autorun(function() {
    if (!Meteor.userId()) {
      var current = FlowRouter.current();
      if (current && !_.contains(AUTH_ROUTES, current.route.name)) {
        Session.set('redirectAfterLogin', current.path);
      }

      FlowRouter.go('login');
    }
  });
});

// Redirect user on login.
Accounts.onLogin(function() {
  var current = FlowRouter.current();
  if (current.route && current.route.name == 'login') {
    var redirect = Session.get('redirectAfterLogin') || 'home';
    Session.set('redirectAfterLogin', undefined);
    FlowRouter.go(redirect);
  }
});


FlowRouter.route('/login', {
  name: 'login',
  action: function() {
    BlazeLayout.render('login');
  }
});

FlowRouter.route('/logout', {
  name: 'logout',
  action: function() {
    Meteor.logout();
  }
});