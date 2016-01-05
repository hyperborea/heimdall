Meteor.methods({
  getStatistics: function() {
    const ownerFilter  = filterByOwnership(this.userId);
    const accessFilter = filterByAccess(this.userId);

    var ownedJobs = Jobs.find(ownerFilter);
    var ownedJobIds = _.pluck(ownedJobs.fetch(), '_id');

    var jobHistory24h = JobHistory.aggregate([
      { $match: 
        { 
          jobId: { $in: ownedJobIds },
          finishedAt: { $gt: moment().subtract(1, 'days').toDate() },
        }
      },
      { $group:
        { 
          _id: '$status',
          count: { $sum: 1 },
          jobs: { $addToSet: '$jobId' },
          avgDuration: { $avg: '$duration' }, 
          maxDuration: { $max: '$duration' },
        }
      }
    ]);

    return {
      owned: {
        dashboards : Dashboards.find(ownerFilter).count(),
        jobs       : ownedJobs.count(),
        sources    : Sources.find(ownerFilter).count(),
      },
      access: {
        dashboards : Dashboards.find(accessFilter).count(),
        jobs       : Jobs.find(accessFilter).count(),
        sources    : Sources.find(accessFilter).count(),
      },
      jobHistory24h: _.chain(jobHistory24h)
        .map( (row) => [row._id, _.omit(row, '_id')] )
        .object()
        .value()
    };
  }
});