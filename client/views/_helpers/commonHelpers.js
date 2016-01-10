Template.registerHelper('increment', (n) => n+1);
Template.registerHelper('moment', (date, spec) => moment(date).format(spec));