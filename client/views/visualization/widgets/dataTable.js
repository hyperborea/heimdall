// import tablesort from 'tablesort';
import tablesort from '/imports/tablesort';
import Mustache from 'mustache';
import { get } from 'lodash';
import { format as d3Format } from 'd3';


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
    const fields = this.fields.map((key) => {
      const config = get(this.settings, `fields.${key}`, {});
      if (config.type !== 'hidden') return { key: key, name: config.name || key }
    });

    return _.compact(fields);
  },
  
  getValue: function(row, key) {
    const config = get(this.settings, `fields.${key}`, {});
    let value = row[key];

    switch (config.type) {
      case 'number':
        const numberFormat = config.format || ',';
        const numberPrefix = config.prefix || '';
        return numberPrefix + d3Format(numberFormat)(value);
      case 'date':
        let dateFormat = config.format || 'YYYY-MM-DD HH:mm:ss';
        return moment(value).format(dateFormat);
      case 'link':
        if (config.url) {
          if (config.url.indexOf('://') === -1) config.url = 'http://' + config.url;
          let text = Blaze._escape(value);
          let url = Blaze._escape( Mustache.render(config.url, row) );
          return Spacebars.SafeString(`<a href="${url}" target="_blank">${text}</a>`);  
        }
        else return value;
      case 'rating':
        const rating = parseInt(value);
        if (rating <= 10) {
          const icon = Blaze._escape(config.icon || 'yellow star');
          const html = _.times(rating, () => `<i class="fitted ${icon} icon"></i>`).join('');
          return Spacebars.SafeString(html);  
        }
        else return '[invalid]';
      default:
        if (value instanceof Date)
          return moment(value).format('YYYY-MM-DD HH:mm:ss');
        else if (!_.isNull(value) && !_.isUndefined(value))
          return value.toString();
    }
  },
});


Template.visDataTableForm.helpers({
  fieldSettings: (field) => get(Template.currentData(), `settings.fields.${field}`, {}),
});

Template.visDataTableFormItem.helpers({
  displayTypes: [
    { value: 'text', text: 'text', icon: 'font' },
    { value: 'hidden', text: 'hidden', icon: 'hide' },
    { value: 'number', text: 'number', icon: 'calculator' },
    { value: 'date', text: 'date', icon: 'calendar' },
    { value: 'link', text: 'link', icon: 'linkify' },
    { value: 'rating', text: 'rating', icon: 'empty star' },
  ],
  numberOptions: [
    { value: ',', text: 'default' },
    { value: ',.2f', text: 'two decimals' },
    { value: '%', text: 'percent' },
  ],
  dateOptions: [
    { value: 'YYYY-MM-DD HH:mm:ss', text: 'YYYY-MM-DD HH:mm:ss' },
    { value: 'YYYY-MM-DD', text: 'YYYY-MM-DD' },
    { value: 'HH:mm:ss', text: 'HH:mm:ss' },
    { value: 'dddd', text: 'Weekday' },
  ],
  ratingIcons: [
    { value: 'yellow star', text: 'star', icon: 'yellow star' },
    { value: 'yellow empty star', text: 'empty star', icon: 'yellow empty star' },
    { value: 'red heart', text: 'heart', icon: 'red heart' },
    { value: 'green smile', text: 'smile', icon: 'green smile' },
    { value: 'orange meh', text: 'meh', icon: 'orange meh' },
    { value: 'red frown', text: 'frown', icon: 'red frown' },
    { value: 'black bomb', text: 'bomb', icon: 'black bomb' },
  ],
  namePath(key) { return `fields[${this.field}][${key}]` },
  isType(type) { return this.config.type === type },
})