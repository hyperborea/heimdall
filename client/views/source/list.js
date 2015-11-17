// loadHandler(Template.sourceList);

Template.sourceList.helpers({
  items: function() {
    return Sources.find();
  }
});