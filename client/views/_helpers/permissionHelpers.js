Template.registerHelper('isAdmin', function(trueValue=true, falseValue) {
  return isAdmin(Meteor.user()) ? trueValue : falseValue;
});

Template.registerHelper('isOwner', function(doc) {
  return isOwner(Meteor.user(), doc);
});

Template.registerHelper('ownerVisibility', function(doc) {
  return isOwner(Meteor.user(), doc) ? 'visible' : 'hidden';
});

Template.registerHelper('ownerOrNewVisibility', function(doc) {
  doc = doc || {};
  return !doc._id || isOwner(Meteor.user(), doc) ? 'visible' : 'hidden';
});