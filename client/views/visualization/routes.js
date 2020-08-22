var visualizationRoutes = FlowRouter.group({
  prefix: "/visualization",
});

visualizationRoutes.route("/:id/edit", {
  name: "visualizationEdit",
  action: render("visualizationForm"),
});
