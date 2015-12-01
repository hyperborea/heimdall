Template.registerHelper('isOwner', function(doc) {
  return isOwner(Meteor.user(), doc);
});

Template.registerHelper('ownerVisibility', function(doc) {
  return isOwner(Meteor.user(), doc) ? 'visible' : 'hidden';
});