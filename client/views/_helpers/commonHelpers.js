Template.registerHelper('publicSetting', (key) => Meteor.settings.public[key]);
Template.registerHelper('increment', (n) => n+1);
Template.registerHelper('moment', (date, spec) => moment(date).format(spec));
Template.registerHelper('list', (arr) => arr && arr.join(', '));
Template.registerHelper('sorted', (arr) => arr && arr.sort());