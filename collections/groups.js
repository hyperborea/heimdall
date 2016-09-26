Groups = new Mongo.Collection('groups');

Groups.schema = new SimpleSchema({
  name: String
});

Groups.attachSchema(Groups.schema);