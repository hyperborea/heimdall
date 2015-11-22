Template.visDataTable.helpers({
  dataKeys: function() {
    var data = Template.currentData().data
    return data ? _.keys(data[0]) : [];
  },
  getField: function(row, key) {
    return row[key].toString();
  }
});