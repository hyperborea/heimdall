const AUTH_ROUTES = ['login', 'logout'];

function redirectAnonymToLogin() {
  if (!Meteor.userId()) {
    const current = FlowRouter.current();
    if (current && !_.contains(AUTH_ROUTES, current.route.name)) {
      Session.set('redirectAfterLogin', current.path);
    }

    FlowRouter.go('login');  
  }
}

// Make sure the user is logged in, otherwise redirect to login page.
FlowRouter.triggers.enter([redirectAnonymToLogin], {except: AUTH_ROUTES});

Meteor.startup(function() {
  Tracker.autorun(redirectAnonymToLogin);
});

// Redirect user on login.
Accounts.onLogin(function() {
  const current = FlowRouter.current();
  if (current.route && current.route.name == 'login') {
    const redirect = Session.get('redirectAfterLogin') || 'home';
    Session.set('redirectAfterLogin', undefined);
    FlowRouter.go(redirect);
  }
});


FlowRouter.route('/login', {
  name: 'login',
  action: () => BlazeLayout.render('login')
});

FlowRouter.route('/logout', {
  name: 'logout',
  action: () => Meteor.logout()
});