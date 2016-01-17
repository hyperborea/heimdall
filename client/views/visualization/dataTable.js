Template.visDataTable.helpers({
  dataKeys: function() {
    var data = Template.currentData().data
    return (data && data.length) ? _.keys(data[0]) : [];
  },
  
  getField: function(row, key) {
    var value = row[key];

    if (value instanceof Date)
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    else
      return _.isNull(value) ? null : value.toString();
  }
});