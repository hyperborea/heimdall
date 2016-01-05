JobHistory = new Mongo.Collection('jobHistory');

logJobHistory = function(job, result, startedAt, finishedAt) {
  JobHistory.insert({
    jobId      : job._id,
    status     : result.status,
    startedAt  : startedAt,
    finishedAt : finishedAt,
    duration   : moment(finishedAt).diff(moment(startedAt))
  });
};