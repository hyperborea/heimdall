Meteor.methods({
  getStatistics: function() {
    const ownerFilter  = filterByOwnership(this.userId);
    const accessFilter = filterByAccess(this.userId);

    return {
      owned: {
        dashboards : Dashboards.find(ownerFilter).count(),
        jobs       : Jobs.find(ownerFilter).count(),
        sources    : Sources.find(ownerFilter).count(),
      },
      accessible: {
        dashboards : Dashboards.find(accessFilter).count(),
        jobs       : Jobs.find(accessFilter).count(),
        sources    : Sources.find(accessFilter).count(),
      }
    };
  }
});