import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { initializeSecurity } from "./utils/security";
import LoginPage from "./components/Login/LoginPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import ProfilePage from "./components/Profile/ProfilePage";
import LoadsPage from "./components/Loads/LoadsPage";
import CreateLoad from "./components/Loads/CreateLoad";
import LoadPage from './components/Loads/CreateLoad'; // Yangi birlashgan fayl
import CustomerBrokerPage from "./components/CustomerBroker/CustomerBrokerPage";
import CustomerBrokerCreatePage from "./components/CustomerBroker/create/CustomerBrokerCreatePage"; // Import CustomerBrokerCreatePage
import CustomerBrokerEditPage from "./components/CustomerBroker/edit/CustomerBrokerEditPage";
import CustomerBrokerViewPage from "./components/CustomerBroker/view/CustomerBrokerViewPage";
import DriverPage from "./components/Driver/DriverPage";
import DriverCreatePage from "./components/Driver/create/DriverCreatePage"; // Import DriverCreatePage
import DispatcherPage from "./components/Dispatcher/DispatcherPage";
import DispatcherCreatePage from "./components/Dispatcher/create/DispatcherCreatePage"; // Import DispatcherCreatePage
import EmployeePage from "./components/Employee/EmployeePage";
import EmployeeCreatePage from "./components/Employee/create/EmployeeCreatePage"; // Import EmployeeCreatePage
import TruckTrailerPage from "./components/TruckTrailer/TruckTrailerPage";
import TruckCreatePage from "./components/TruckTrailer/truck/TruckCreatePage";
import TrailerCreatePage from "./components/TruckTrailer/trailer/TrailerCreatePage";
import AccountingPage from "./components/Accounting/AccountingPage";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout/Layout";
import { SidebarProvider } from "./components/SidebarContext";
import { useAuth } from "./context/AuthContext";
import UsersActivesPage from "./components/UsersActives/UsersActivesPage"; 
import DriverViewPage from "./components/Driver/DriverViewPage";
import DriverPayCreatePage from "./components/Driver/create/DriverPayCreatePage";
import DriverExpenseCreatePage from "./components/Driver/create/DriverExpenseCreatePage";
import DriverEditPage from "./components/Driver/DriverEditPage";
import DriverPayEditPage from './components/Driver/create/DriverPayEditPage';
import DriverExpenseEditPage from './components/Driver/create/DriverExpenseEditPage';
import LoadViewPage from './components/Loads/LoadViewPage'; // Import LoadViewPage
import ManageUsersPage from "./components/ManageUsers/ManageUsersPage";
import UnitManagementPage from "./components/ManageUsers/UnitManagementPage";
import TeamManagementPage from "./components/ManageUsers/TeamManagementPage";
import TruckView from "./components/TruckTrailer/truck/TruckView";
import TruckEdit from "./components/TruckTrailer/truck/TruckEdit";
import TrailerView from "./components/TruckTrailer/trailer/TrailerView";
import TrailerEdit from "./components/TruckTrailer/trailer/TrailerEdit";
import DispatcherViewPage from "./components/Dispatcher/DispatcherViewPage";
import DispatcherEditPage from "./components/Dispatcher/DispatcherEditPage";
import EmployeeViewPage from "./components/Employee/EmployeeViewPage";
import EmployeeEditPage from "./components/Employee/EmployeeEditPage";
import IftaPage from "./components/IFTA/IftaPage";
import PermissionDenied from "./components/PermissionDenied";
import SettingsPage from "./components/Settings/SettingsPage";

const App = () => {
  const { isAuthenticated: isAuth } = useAuth();
  const isAuthenticated = isAuth || localStorage.getItem("accessToken");

  // Xavfsizlik sozlamalarini ishga tushirish
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      initializeSecurity();
    }
  }, []);

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              isAuthenticated ? <Layout /> : <Navigate to="/auth/login" />
            }
          >
            <Route
              path="dashboard"
              element={
                <PermissionGuard permissionKey="dashboard">
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="profile"
              element={
                <PermissionGuard permissionKey="profile">
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="loads"
              element={
                <PermissionGuard permissionKey="loads">
                  <PrivateRoute>
                    <LoadsPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="loads/create"
              element={
                <PermissionGuard permissionKey="loads_create">
                  <PrivateRoute>
                    <CreateLoad />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route path="/loads/edit/:id" element={<LoadPage />} />
            <Route path="/loads/view/:id" element={<LoadViewPage />} />
            <Route
              path="customer_broker"
              element={
                <PermissionGuard permissionKey="customer_broker">
                  <PrivateRoute>
                    <CustomerBrokerPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="customer_broker/create"
              element={
                <PermissionGuard permissionKey="customer_broker_create">
                  <PrivateRoute>
                    <CustomerBrokerCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="customer_broker/:id"
              element={
                <PermissionGuard permissionKey="customer_broker_view">
                  <PrivateRoute>
                    <CustomerBrokerViewPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="customer_broker/:id/edit"
              element={
                <PermissionGuard permissionKey="customer_broker_edit">
                  <PrivateRoute>
                    <CustomerBrokerEditPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver"
              element={
                <PermissionGuard permissionKey="driver">
                  <PrivateRoute>
                    <DriverPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/create"
              element={
                <PermissionGuard permissionKey="driver_create">
                  <PrivateRoute>
                    <DriverCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/:id"
              element={
                <PermissionGuard permissionKey="driver_view">
                  <PrivateRoute>
                    <DriverViewPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/:id/edit"
              element={
                <PermissionGuard permissionKey="driver_edit">
                  <PrivateRoute>
                    <DriverEditPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/:id/pay/create"
              element={
                <PermissionGuard permissionKey="driver_pay_create">
                  <PrivateRoute>
                    <DriverPayCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/:id/pay/:payId/edit"
              element={
                <PermissionGuard permissionKey="driver_pay_edit">
                  <PrivateRoute>
                    <DriverPayEditPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/:id/expense/create"
              element={
                <PermissionGuard permissionKey="driver_expense_create">
                  <PrivateRoute>
                    <DriverExpenseCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="driver/:id/expense/:expenseId/edit"
              element={
                <PermissionGuard permissionKey="driver_expense_edit">
                  <PrivateRoute>
                    <DriverExpenseEditPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />

            <Route
              path="dispatcher"
              element={
                <PermissionGuard permissionKey="dispatcher">
                  <PrivateRoute>
                    <DispatcherPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="dispatcher/create"
              element={
                <PermissionGuard permissionKey="dispatcher_create">
                  <PrivateRoute>
                    <DispatcherCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="dispatcher/:id"
              element={
                <PermissionGuard permissionKey="dispatcher_view">
                  <PrivateRoute>
                    <DispatcherViewPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="dispatcher/edit/:id"
              element={
                <PermissionGuard permissionKey="dispatcher_edit">
                  <PrivateRoute>
                    <DispatcherEditPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="users-actives"
              element={
                <PermissionGuard permissionKey="users_actives">
                  <PrivateRoute>
                    <UsersActivesPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="employee"
              element={
                <PermissionGuard permissionKey="employee">
                  <PrivateRoute>
                    <EmployeePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="employee/create"
              element={
                <PermissionGuard permissionKey="employee_create">
                  <PrivateRoute>
                    <EmployeeCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="employee/:id"
              element={
                <PermissionGuard permissionKey="employee_view">
                  <PrivateRoute>
                    <EmployeeViewPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="employee/edit/:id"
              element={
                <PermissionGuard permissionKey="employee_edit">
                  <PrivateRoute>
                    <EmployeeEditPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="truck_trailer"
              element={
                <PermissionGuard permissionKey="truck_trailer">
                  <PrivateRoute>
                    <TruckTrailerPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="truck"
              element={
                <PermissionGuard permissionKey="truck">
                  <PrivateRoute>
                    <TruckTrailerPage type="truck" />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="trailer"
              element={
                <PermissionGuard permissionKey="trailer">
                  <PrivateRoute>
                    <TruckTrailerPage type="trailer" />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="truck/create"
              element={
                <PermissionGuard permissionKey="truck_create">
                  <PrivateRoute>
                    <TruckCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="truck/:id"
              element={
                <PermissionGuard permissionKey="truck_view">
                  <PrivateRoute>
                    <TruckView />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="truck/:id/edit"
              element={
                <PermissionGuard permissionKey="truck_edit">
                  <PrivateRoute>
                    <TruckEdit />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="trailer/create"
              element={
                <PermissionGuard permissionKey="trailer_create">
                  <PrivateRoute>
                    <TrailerCreatePage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="trailer/:id"
              element={
                <PermissionGuard permissionKey="trailer_view">
                  <PrivateRoute>
                    <TrailerView />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="trailer/:id/edit"
              element={
                <PermissionGuard permissionKey="trailer_edit">
                  <PrivateRoute>
                    <TrailerEdit />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="accounting"
              element={
                <PermissionGuard permissionKey="accounting">
                  <PrivateRoute>
                    <AccountingPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="ifta"
              element={
                <PermissionGuard permissionKey="ifta">
                  <PrivateRoute>
                    <IftaPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="manage-users"
              element={
                <PermissionGuard permissionKey="manage_users">
                  <PrivateRoute>
                    <ManageUsersPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="manage-units"
              element={
                <PermissionGuard permissionKey="manage_units">
                  <PrivateRoute>
                    <UnitManagementPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="manage-teams"
              element={
                <PermissionGuard permissionKey="manage_teams">
                  <PrivateRoute>
                    <TeamManagementPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="ifta"
              element={
                <PermissionGuard permissionKey="ifta">
                  <PrivateRoute>
                    <IftaPage />
                  </PrivateRoute>
                </PermissionGuard>
              }
            />
            <Route
              path="settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to={getFirstAllowedRoute()} /> : <Navigate to="/auth/login" />
            }
          />
        </Routes>
      </Router>
    </SidebarProvider>

  );
};

// PermissionGuard component
function PermissionGuard({ permissionKey, children }) {
  const permissionsEnc = localStorage.getItem("permissionsEnc");
  let permissions = {};
  if (permissionsEnc) {
    try {
      permissions = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
    } catch (e) {
      permissions = {};
    }
  }
  if (permissionKey && permissions[permissionKey] === false) {
    return <PermissionDenied />;
  }
  return children;
}

// Helper to find first allowed route
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
  // List of sidebar routes and their permission keys (must match Sidebar.jsx)
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

export default App;