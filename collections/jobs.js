Jobs = new Mongo.Collection('jobs');

Jobs.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
});