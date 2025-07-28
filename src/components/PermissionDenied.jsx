import React from "react";
import { useNavigate } from "react-router-dom";
import { MdBlock } from "react-icons/md";

function getFirstAllowedRoute() {
  const permissionsEnc = localStorage.getItem("permissionsEnc");
  let permissions = {};
  if (permissionsEnc) {
    try {
      permissions = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
    } catch (e) {
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
    { path: "/ifta", key: "ifta" },
    { path: "/manage-users", key: "manage_users" },
    { path: "/manage-units", key: "manage_units" },
    { path: "/manage-teams", key: "manage_teams" },
  ];
  for (const route of sidebarRoutes) {
    if (permissions[route.key] === true) {
      return route.path;
    }
  }
  return null;
}

const PermissionDenied = () => {
  const navigate = useNavigate();
  const firstAllowed = getFirstAllowedRoute();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <MdBlock style={{ color: '#ef4444', fontSize: '4rem', marginBottom: '1rem' }} />
      <h1 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>Permission Denied</h1>
      <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center', maxWidth: 400 }}>
        You do not have permission to access this page. Please contact your administrator if you believe this is a mistake.
      </p>
      {firstAllowed ? (
        <button onClick={() => navigate(firstAllowed)} style={{ padding: '10px 24px', background: '#0093E9', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          Go to Allowed Page
        </button>
      ) : (
        <button disabled style={{ padding: '10px 24px', background: '#ccc', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'not-allowed' }}>
          No Access
        </button>
      )}
    </div>
  );
};

export default PermissionDenied; 