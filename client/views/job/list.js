loadHandler(Template.jobList);


function jobsFilter() {
  var selector = {};

  if (FlowRouter.getQueryParam('search'))
    selector['$or'] = [
      { name  : { $regex: FlowRouter.getQueryParam('search'), $options: 'i' } },
      { owner : { $regex: FlowRouter.getQueryParam('search'), $options: 'i' } },
    ];
  if (FlowRouter.getQueryParam('filterOwn'))
    selector['ownerId'] = Meteor.userId();
  if (FlowRouter.getQueryParam('status'))
    selector['status'] = FlowRouter.getQueryParam('status');

  return selector;
}


Template.jobList.onCreated(function() {
  this.limit = new ReactiveVar();

  this.autorun(() => {
    jobsFilter();
    this.limit.set(20);
  });

  this.autorun(() => {
    this.subscribe('jobs', jobsFilter(), this.limit.get());
  });
});


Template.jobList.onRendered(function() {
  var template = this;

  template.$('.ui.checkbox').checkbox();

  template.$('.ui.list').visibility({
    once: false,
    observeChanges: true,
    onBottomVisible() {
      if (template.subscriptionsReady()) {
        template.$('.js-load-more').click();
      } 
    }
  });
});


Template.jobList.helpers({
  jobs: function() {
    return Jobs.find(jobsFilter(), { sort: { createdAt: -1 } });
  },
  statusOptions: [
    { value: 'ok', text: 'success', icon: 'green checkmark' },
    { value: 'running', text: 'running', icon: 'refresh' },
    { value: 'error', text: 'error', icon: 'red remove' },
  ],

  search: () => FlowRouter.getQueryParam('search'),
  filterOwn: () => FlowRouter.getQueryParam('filterOwn') === 'true',
  status: () => FlowRouter.getQueryParam('status'),
  icon: (job) => 
    (job.status === 'error') && 'red remove' ||
    (job.status === 'running') && 'refresh' ||
    'angle right',
  hasError: (job) => job.status === 'error',

  hasMore: function(items) {
    return !Template.instance().subscriptionsReady() || 
      items.count() >= Template.instance().limit.get();
  },
});


Template.jobList.events({
  'keyup input[name=search], change input[name=search]': (event) => FlowRouter.setQueryParams({ search: event.target.value || null }),
  'change input[name=filterOwn]': (event) => FlowRouter.setQueryParams({ filterOwn: event.target.checked }),
  'change input[name=status]': (event) => FlowRouter.setQueryParams({ status: event.target.value || null }),
  'click .js-load-more': (event, template) => template.limit.set(template.limit.get() + 10),
});