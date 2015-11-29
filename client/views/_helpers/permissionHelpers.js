Template.registerHelper('isOwner', function(doc) {
  return isOwner(Meteor.user(), doc);
});