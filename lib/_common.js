getUser = function (userOrId) {
  var user = _.isString(userOrId) ? Meteor.users.findOne(userOrId) : userOrId;
  return user || {};
};

tokenize = function (str) {
  return str.split(",").map((item) => item.trim());
};
