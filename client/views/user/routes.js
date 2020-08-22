var userRoutes = FlowRouter.group({
  prefix: "/user",
});

userRoutes.route("/list", {
  name: "userList",
  action: render("userList"),
});

userRoutes.route("/:id", {
  name: "userView",
  action: render("userView"),
});
