getStarred = function(entityType, userId) {
  var user = userId ? getUser(userId) : Meteor.user();
  var starredObj = ((user || {}).profile || {}).starred || {};

  return starredObj[entityType] || [];
};


hasStarred = function(entityType, entityId, userId) {
  return _.contains(getStarred(entityType, userId), entityId);
};


toggleStar = function(entityType, entityId, userId) {
  var user = userId ? getUser(userId) : Meteor.user();
  
  var spec = {};
  spec[`profile.starred.${entityType}`] = entityId;

  if (hasStarred(entityType, entityId, userId))
    Meteor.users.update(user._id, { $pull: spec });
  else
    Meteor.users.update(user._id, { $addToSet: spec });
};