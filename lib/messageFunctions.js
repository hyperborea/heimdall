sendSlack = function (payload) {
  if (Meteor.settings.slackHookURL) {
    HTTP.post(Meteor.settings.slackHookURL, {
      data: payload,
    });
  }
};
