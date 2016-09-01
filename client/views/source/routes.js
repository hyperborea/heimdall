var sourceRoutes = FlowRouter.group({
  prefix: '/sources'
});

sourceRoutes.route('/', {
  name: 'sourceList',
  action: render('sourceList')
});

sourceRoutes.route('/new', {
  name: 'sourceNew',
  action: render('sourceForm')
});

sourceRoutes.route('/:id/edit', {
  name: 'sourceEdit',
  action: render('sourceForm')
});