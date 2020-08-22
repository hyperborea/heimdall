Template.statistics.onCreated(function () {
  this.statistics = new ReactiveVar();

  Meteor.call("getStatistics", (err, res) => {
    this.statistics.set(res);
  });
});

Template.statistics.helpers({
  statistics: () => Template.instance().statistics.get(),
});

Template.statisticsJobHistory24h.helpers({
  formatDuration: (ms) => Math.round(moment.duration(ms).asSeconds()),
});
