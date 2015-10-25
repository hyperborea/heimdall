var pg = Meteor.npmRequire('pg');

Meteor.methods({
  query: function(jobId) {
    var job = Jobs.findOne(jobId);
    var source = Sources.findOne(job.sourceId);

    if (job && source && job.query) {
      const conString = `postgres://${source.username}:${source.password}@${source.host}:${source.port}/${source.database}`
      console.log(conString);
    
      pg.connect(conString, Meteor.bindEnvironment(function(err, client, done) {
        console.log(err);

        client.query(job.query, Meteor.bindEnvironment(function(err, result) {
          console.log(err);
          Jobs.update(jobId, {$set: {result: result.rows}});
        }));
      }));
    }
    else throw new Meteor.Error("Can't query job, something is missing.");
  }
});