// Template.visDataTable.helpers({
//   templateName: function() {
//     const templateMapping = {
//       error   : 'visDataTableError',
//       running : 'visDataTableRunning',
//       ok      : 'visDataTableOK'
//     }

//     const context = Template.currentData();
//     return context && templateMapping[context.status];
//   }
// });


Template.visDataTable.helpers({
  dataKeys: function() {
    var data = Template.currentData().data
    return data ? _.keys(data[0]) : [];
  },
  getField: function(row, key) {
    return row[key];
  }
});


// Template.visDataTableRunning.events({
//   'click .js-cancel': function(event, template) {
//     Meteor.call('cancelJob', template.data.jobId);
//   }
// });