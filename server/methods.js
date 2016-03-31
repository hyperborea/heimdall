Meteor.methods({
  getStatistics: function() {
    const ownerFilter  = filterByOwnership(this.userId);
    const accessFilter = filterByAccess(this.userId);

    var ownedJobs = Jobs.find(ownerFilter, { fields: { _id: 1 } });
    var ownedJobIds = _.pluck(ownedJobs.fetch(), '_id');

    var accessDashboards = Dashboards.find(accessFilter, { fields: { _id: 1 } });
    var accessDashboardIds = _.pluck(accessDashboards.fetch(), '_id');

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

    var dashboardToplist7d = Requests.aggregate([
      { $match:
        {
          routeName: 'dashboardView',
          "params.id": { $in: accessDashboardIds },
          requestedAt: { $gt: moment().subtract(7, 'days').toDate() },
        },
      },
      { $group:
        {
          _id: { dashboardId: '$params.id', user: '$userId' },
          count: { $sum: 1 }
        }
      },
      { $group:
        {
          _id: '$_id.dashboardId',
          userCount: { $sum: 1 },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { totalCount: -1 } },
      { $limit: 15 }
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
        .value(),
      dashboardToplist7d: _.map(dashboardToplist7d, (item) => {
        var dashboard = Dashboards.findOne(item._id, { fields: { title: 1, owner: 1 } });
        return _.extend(item, dashboard);
      })
    };
  }
});