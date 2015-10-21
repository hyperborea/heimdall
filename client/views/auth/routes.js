AUTH_ROUTES = ['login', 'logout'];

// Make sure the user is logged in, otherwise redirect to login page.
Meteor.startup(function() {
  Tracker.autorun(function() {
    if (!Meteor.userId()) {
      var route = FlowRouter.current().route;
      if (!_.contains(AUTH_ROUTES, route.name)) {
        Session.set('redirectAfterLogin', route.path);
      }

      FlowRouter.go('login');
    }
  });
});

// Redirect user on login.
Accounts.onLogin(function() {
  if (FlowRouter.current().route.name == 'login') {
    var redirect = Session.get('redirectAfterLogin') || 'home';
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