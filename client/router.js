FlowRouter.route('/', {
  name: 'home',
  action: () => FlowRouter.go('/jobs')
});