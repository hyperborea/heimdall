loadHandler(Template.jobList);

Template.jobList.onCreated(function() {
  this.subscribe('jobs');
  Session.setDefault('jobList.search', '');
  Session.setDefault('jobList.filterOwn', false);
});


Template.jobList.onRendered(function() {
  this.$('.ui.checkbox').checkbox();
});


Template.jobList.helpers({
  jobs: function() {
    var selector = {};

    if (Session.get('jobList.search'))
      selector['name'] = { $regex: Session.get('jobList.search'), $options: 'i' };
    if (Session.get('jobList.filterOwn'))
      selector['ownerId'] = Meteor.userId();


    return Jobs.find(selector, { sort: { createdAt: -1 } });
  },

  search: () => Session.get('jobList.search'),
  filterOwn: () => Session.get('jobList.filterOwn'),
});


Template.jobList.events({
  'keyup, change input[name=search]': function(event) {
    Session.set('jobList.search', event.target.value);
  },

  'change input[name=filterOwn]': function(event) {
    Session.set('jobList.filterOwn', event.target.checked);
  }
});