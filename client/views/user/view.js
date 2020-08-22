function userId() {
  return FlowRouter.getParam("id");
}

Template.userView.onCreated(function () {
  this.state = new ReactiveDict();
  this.subscribe("user", userId());
});

Template.userView.helpers({
  user: () => Meteor.users.findOne(userId()),
  state: (key) => Template.instance().state.get(key),
  isCurrentUser: () => Meteor.userId() === userId(),
  showAdminPanel: () => isAdmin() && Meteor.userId() !== userId(),
});

Template.userView.events({
  "submit .js-profile-form": function (event, template) {
    event.preventDefault();
    Meteor.call("updateProfile", userId(), $(event.target).serializeJSON());
  },

  "submit .js-password-form": function (event, template) {
    event.preventDefault();
    const $form = $(event.target);
    const $message = template.$(".ui.message");

    Accounts.changePassword(
      template.find("[name=oldPassword]").value,
      template.find("[name=newPassword]").value,
      function (err) {
        if (err) {
          template.state.set("passwordErrorMessage", err.reason);
          $form.removeClass("success").addClass("error");
        } else {
          template.state.set(
            "passwordSuccessMessage",
            "Password changed successfully."
          );
          $form.removeClass("error").addClass("success");
          $form.get(0).reset();
        }
      }
    );
  },

  "submit .js-groups-form": function (event, template) {
    event.preventDefault();
    const data = $(event.target).serializeJSON();
    Meteor.call("updateUserGroups", userId(), data.groups);
  },

  "click .js-reset-password": function (event, template) {
    confirmModal("Sure you want to reset this users password?", function () {
      Meteor.call("resetUserPassword", userId(), (err, res) => {
        if (err) {
          template.state.set("adminMessageClass", "error");
          template.state.set("adminMessage", `ERROR: ${err.reason}`);
        } else {
          template.state.set("adminMessageClass", "success");
          template.state.set(
            "adminMessage",
            `Password successfully reset to "${res}".`
          );
        }
      });
    });
  },

  "click .js-delete": function () {
    confirmModal(
      "Are you really sure you want to delete this user?",
      function () {
        Meteor.call("deleteUser", userId());
        FlowRouter.go("userList");
      }
    );
  },
});
