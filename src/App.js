import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

const App = () => {
  const { isAuthenticated: isAuth } = useAuth();
  const isAuthenticated = isAuth || localStorage.getItem("accessToken");

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
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="loads"
              element={
                <PrivateRoute>
                  <LoadsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="loads/create"
              element={
                <PrivateRoute>
                  <CreateLoad />
                </PrivateRoute>
              }
            />
            <Route path="/loads/edit/:id" element={<LoadPage />} />
            <Route path="/loads/view/:id" element={<LoadViewPage />} />
            <Route
              path="customer_broker"
              element={
                <PrivateRoute>
                  <CustomerBrokerPage />
                </PrivateRoute>
              }
            />
            <Route
              path="customer_broker/create"
              element={
                <PrivateRoute>
                  <CustomerBrokerCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="customer_broker/:id"
              element={
                <PrivateRoute>
                  <CustomerBrokerViewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="customer_broker/:id/edit"
              element={
                <PrivateRoute>
                  <CustomerBrokerEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver"
              element={
                <PrivateRoute>
                  <DriverPage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/create"
              element={
                <PrivateRoute>
                  <DriverCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/:id"
              element={
                <PrivateRoute>
                  <DriverViewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/:id/edit"
              element={
                <PrivateRoute>
                  <DriverEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/:id/pay/create"
              element={
                <PrivateRoute>
                  <DriverPayCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/:id/pay/:payId/edit"
              element={
                <PrivateRoute>
                  <DriverPayEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/:id/expense/create"
              element={
                <PrivateRoute>
                  <DriverExpenseCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver/:id/expense/:expenseId/edit"
              element={
                <PrivateRoute>
                  <DriverExpenseEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="dispatcher"
              element={
                <PrivateRoute>
                  <DispatcherPage />
                </PrivateRoute>
              }
            />
            <Route
              path="dispatcher/create"
              element={
                <PrivateRoute>
                  <DispatcherCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="dispatcher/:id"
              element={
                <PrivateRoute>
                  <DispatcherViewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="dispatcher/edit/:id"
              element={
                <PrivateRoute>
                  <DispatcherEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="users-actives"
              element={
                <PrivateRoute>
                  <UsersActivesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="employee"
              element={
                <PrivateRoute>
                  <EmployeePage />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/create"
              element={
                <PrivateRoute>
                  <EmployeeCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/:id"
              element={
                <PrivateRoute>
                  <EmployeeViewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="employee/edit/:id"
              element={
                <PrivateRoute>
                  <EmployeeEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="truck_trailer"
              element={
                <PrivateRoute>
                  <TruckTrailerPage />
                </PrivateRoute>
              }
            />
            <Route
              path="truck"
              element={
                <PrivateRoute>
                  <TruckTrailerPage type="truck" />
                </PrivateRoute>
              }
            />
            <Route
              path="trailer"
              element={
                <PrivateRoute>
                  <TruckTrailerPage type="trailer" />
                </PrivateRoute>
              }
            />
            <Route
              path="truck/create"
              element={
                <PrivateRoute>
                  <TruckCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="truck/:id"
              element={
                <PrivateRoute>
                  <TruckView />
                </PrivateRoute>
              }
            />
            <Route
              path="truck/:id/edit"
              element={
                <PrivateRoute>
                  <TruckEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="trailer/create"
              element={
                <PrivateRoute>
                  <TrailerCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="trailer/:id"
              element={
                <PrivateRoute>
                  <TrailerView />
                </PrivateRoute>
              }
            />
            <Route
              path="trailer/:id/edit"
              element={
                <PrivateRoute>
                  <TrailerEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="accounting"
              element={
                <PrivateRoute>
                  <AccountingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="manage-users"
              element={
                <PrivateRoute>
                  <ManageUsersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="manage-units"
              element={
                <PrivateRoute>
                  <UnitManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="manage-teams"
              element={
                <PrivateRoute>
                  <TeamManagementPage />
                </PrivateRoute>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/auth/login" />
            }
          />
        </Routes>
      </Router>
    </SidebarProvider>

  );
};

export default App;