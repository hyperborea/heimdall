Tags = new Mongo.Collection('tags');


if (Meteor.isServer) {
  Tags._ensureIndex({ type: 1 });
}