export function getFirstAllowedRoute() {
  const permissionsEnc = localStorage.getItem("permissionsEnc");
  let permissions = {};

  if (permissionsEnc) {
    try {
      permissions = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
    } catch (error) {
      console.error("Failed to decode permissions", error);
      permissions = {};
    }
  }

  const sidebarRoutes = [
    { path: "/loads", key: "loads" },
    { path: "/truck", key: "vehicles" },
    { path: "/trailer", key: "vehicles" },
    { path: "/customer_broker", key: "customer_broker" },
    { path: "/driver", key: "driver" },
    { path: "/employee", key: "employee" },
    { path: "/dispatcher", key: "dispatcher" },
    { path: "/users-actives", key: "users_actives" },
    { path: "/accounting", key: "accounting" },
    { path: "/manage-users", key: "manage_users" },
    { path: "/manage-units", key: "manage_units" },
    { path: "/manage-teams", key: "manage_teams" },
    { path: "/ifta", key: "ifta" },
  ];

  for (const route of sidebarRoutes) {
    if (permissions[route.key] === true) {
      return route.path;
    }
  }

  return "/permission-denied";
}
