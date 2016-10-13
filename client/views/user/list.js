loadHandler(Template.userList);

Template.userList.onCreated(function() {
  this.state = new ReactiveDict();
  this.subscribe('users');
});

Template.userList.helpers({
  users: () => Meteor.users.find({}, { sort: { username: 1 } }),
  state: (key) => Template.instance().state.get(key),
});

Template.userList.events({
  'submit form': function(event, template) {
    event.preventDefault();
    const $form = $(event.target);
    const username = $form.find('input').val();

    Meteor.call('createUserWithRandomPassword', username, (err, res) => {
      if (err) {
        template.state.set('createErrorMessage', err.reason);
        $form.removeClass('success').addClass('error');
      }
      else {
        template.state.set('createSuccessMessage', `User "${username}" successfully created with password "${res}".`);
        $form.removeClass('error').addClass('success');
        $form.get(0).reset();
      }
    });
  }
});