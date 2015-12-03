Template.registerHelper('isOwner', function(doc) {
  return isOwner(Meteor.user(), doc);
});

Template.registerHelper('ownerVisibility', function(doc) {
  return isOwner(Meteor.user(), doc) ? 'visible' : 'hidden';
});

Template.registerHelper('ownerOrNewVisibility', function(doc) {
  return !doc || isOwner(Meteor.user(), doc) ? 'visible' : 'hidden';
});