var dashboardRoutes = FlowRouter.group({
  prefix: "/dashboards",
});

dashboardRoutes.route("/", {
  name: "dashboardList",
  action: render("dashboardList"),
});

dashboardRoutes.route("/present", {
  name: "dashboardPresent",
  action: render("dashboardPresent"),
});

dashboardRoutes.route("/new", {
  name: "dashboardNew",
  action: render("dashboardForm"),
});

dashboardRoutes.route("/:id/edit", {
  name: "dashboardEdit",
  action: render("dashboardForm"),
});

dashboardRoutes.route("/:id", {
  name: "dashboardView",
  action: render("dashboardView"),
});
