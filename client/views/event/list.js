import d3 from 'd3';
import d3KitTimeline from 'd3kit-timeline';


Template.eventList.onCreated(function() {
  this.subscribe('events');
});


Template.eventList.onRendered(function() {
  this.$('form').form({
    inline: true,
    fields: {
      date: 'regExp[/^\\d{4}\-\\d{2}\-\\d{2}$/]',
      title: 'empty',
    }
  });

  this.$('.ui.calendar').calendar({ type: 'date' });
});

Template.eventList.onRendered(function() {
  var colorScale = d3.scale.category10();

  var container = this.find('.timeline');
  var width = $(container).width();
  var chart = new d3KitTimeline(container, {
    direction    : 'up',
    initialWidth : width,
    labelBgColor : (d) => colorScale(d.name),
    dotColor     : (d) => colorScale(d.name),
    linkColor    : (d) => colorScale(d.name),
    textFn       : (d) => d.name,
    labella      : { maxPos: width }
  });

  this.autorun(function() {
    var data = Events.find().map((event) => Object({
      time: new Date(event.date),
      name: event.title
    }));

    chart.data(data).resizeToFit();
  });
});


Template.eventList.helpers({
  events: () => Events.find()
});


Template.eventList.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    Events.insert(data);

    $(event.target).form('reset');
  }
});


Template.eventItem.events({
  'click .js-delete': function(event, template) {
    Events.remove(this._id);
  }
});