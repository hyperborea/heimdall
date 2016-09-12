// import tablesort from 'tablesort';
import tablesort from '/imports/tablesort';
import { get } from 'lodash';


Template.visDataTable.onRendered(function() {
  var sorter = tablesort(this.find('table'), {
    sortedClass: 'sorted',
    ascendingClass: 'ascending',
    descendingClass: 'descending',
  });

  this.autorun(() => {
    Template.currentData();
    sorter.refresh();
  });
});


Template.visDataTable.helpers({
  columns: function() {
    const fieldSettings = this.settings.fields || {};
    const fields = this.fields.map((field) => {
      const config = fieldSettings[field] || {};
      if (config.type !== 'hidden') return { key: field, name: config.name || field }
    });

    return _.compact(fields);
  },
  
  getField: function(row, key) {
    var value = row[key];

    if (value instanceof Date)
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    else
      return _.isNull(value) ? null : value.toString();
  },
});


Template.visDataTableForm.helpers({
  displayTypes: ['text', 'hidden'],
  namePath: (field, key) => `fields[${field}][${key}]`,
  fieldValue: (field, key) => get(Template.currentData(), `settings.fields.${field}.${key}`)
});