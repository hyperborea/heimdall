render = function(templateName) {
  return function() {
    BlazeLayout.render('layout', {main: templateName});
  }
}