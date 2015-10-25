Meteor.methods({
  query: function(jobId) {
    var job = Jobs.findOne(jobId);
    var source = Sources.findOne(job.sourceId);

    queryPostgres(source, job.query, function(result) {
      Jobs.update(jobId, {$set: {result: result}});  
    });
  }
});