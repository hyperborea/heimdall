isUser = function(userId) {
  return userId;
};

isAdmin = function(userId) {
  return Roles.userIsInRole(userId, 'admin');
};

isOwner = function(userId, ownerId) {
  return (userId === ownerId) || isAdmin(userId);
};


filterByOwnership = function(userId) {
  return isAdmin(userId) ? {} : { ownerId: userId };
};


requireUser = function(userId) {
  if (!isUser(userId)) {
    throw new Meteor.Error('access-denied', "You must be logged in for that action");
  }
};

requireOwnership = function(userId, ownerId) {
  if (!isOwner(userId, ownerId)) {
    throw new Meteor.Error('access-denied', "You don't have ownership for this entity");
  }
};