loadHandler(Template.jobList);


function jobsFilter() {
  var selector = {};

  if (Session.get('jobList.search'))
    selector['name'] = { $regex: Session.get('jobList.search'), $options: 'i' };
  if (Session.get('jobList.filterOwn'))
    selector['ownerId'] = Meteor.userId();
  if (Session.get('jobList.status'))
    selector['status'] = Session.get('jobList.status');

  return selector;
}


Template.jobList.onCreated(function() {
  this.autorun(() => {
    jobsFilter();
    Session.set('jobList.limit', 20);
  });

  this.autorun(() => {
    this.subscribe('jobs', jobsFilter(), { limit: Session.get('jobList.limit') });
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

  search: () => Session.get('jobList.search'),
  filterOwn: () => Session.get('jobList.filterOwn'),
  status: () => Session.get('jobList.status'),
  icon: (job) => 
    (job.status === 'error') && 'red remove' ||
    (job.status === 'running') && 'refresh' ||
    'angle right',
  hasError: (job) => job.status === 'error',

  hasMore: function(items) {
    return !Template.instance().subscriptionsReady() || 
      items.count() >= Session.get('jobList.limit');
  },
});


Template.jobList.events({
  'keyup input[name=search], change input[name=search]': (event) => Session.set('jobList.search', event.target.value),
  'change input[name=filterOwn]': (event) => Session.set('jobList.filterOwn', event.target.checked),
  'change input[name=status]': (event) => Session.set('jobList.status', event.target.value),
  'click .js-load-more': () => Session.set('jobList.limit', Session.get('jobList.limit') + 10),
});