Template.statistics.onCreated(function() {
  this.counts = new ReactiveVar();

  Meteor.call('getStatistics', (err, res) => {
    this.counts.set(res);
  });
});


Template.statistics.helpers({
  counts: () => Template.instance().counts.get()
});