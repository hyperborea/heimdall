var pg = Meteor.npmRequire('pg');

Meteor.methods({
  query: function(jobId) {
    var job = Jobs.findOne(jobId);

    if (job && job.query) {
      var conString = "postgres://test:test@192.168.99.100:5432/test";
    
      pg.connect(conString, Meteor.bindEnvironment(function(err, client, done) {
        console.log(err);

        client.query(job.query, Meteor.bindEnvironment(function(err, result) {
          console.log(err);
          console.log(result);
          Jobs.update(jobId, {$set: {result: result.rows}});
        }));
      }));
    }
  }
});