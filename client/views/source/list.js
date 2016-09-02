loadHandler(Template.sourceList);


function sourceFilter() {
  var selector = {};

  if (FlowRouter.getQueryParam('search'))
    selector['$or'] = [
      { name  : { $regex: FlowRouter.getQueryParam('search'), $options: 'i' } },
      { owner : { $regex: FlowRouter.getQueryParam('search'), $options: 'i' } },
    ];
  if (FlowRouter.getQueryParam('filterOwn') === 'true')
    selector['ownerId'] = Meteor.userId();
  
  return selector;
}


Template.sourceList.onCreated(function() {
  this.limit = new ReactiveVar();

  this.autorun(() => {
    sourceFilter();
    this.limit.set(30);
  });

  this.autorun( () => this.subscribe('sources', sourceFilter(), this.limit.get()) );
});


Template.sourceList.onRendered(function() {
  var template = this;

  template.$('.ui.checkbox').checkbox();

  template.$('.ui.cards').visibility({
    once: false,
    observeChanges: true,
    onBottomVisible() {
      if (template.subscriptionsReady()) {
        template.$('.js-load-more').click();
      } 
    }
  });
});


Template.sourceList.helpers({
  sources: function() {
    return Sources.find();
  },

  hasMore: function(items) {
    return !Template.instance().subscriptionsReady() || 
      items.count() >= Template.instance().limit.get();
  },
});


Template.sourceList.events({
  'keyup input[name=search], change input[name=search]': (event) => FlowRouter.setQueryParams({ search: event.target.value || null }),
  'change input[name=filterOwn]': (event) => FlowRouter.setQueryParams({ filterOwn: event.target.checked || null }),
  'click .js-load-more': (event, template) => template.limit.set(template.limit.get() + 10),
});