import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { lightLogo } from "../../images";
import "./sidebar.scss";
import { useTranslation } from "react-i18next";
import { MdSpaceDashboard, MdExpandMore, MdExpandLess, MdAccountBalance } from "react-icons/md";
import { FaTruckLoading, FaTruck, FaTrailer } from "react-icons/fa";
import { MdOutlineSupervisedUserCircle } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { FaUserTie, FaUsers, FaRedRiver, FaUserCog } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    // Read encoded permissions from localStorage
    const permissionsEnc = localStorage.getItem("permissionsEnc");
    if (permissionsEnc) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
        setPermissions(decoded);
      } catch (e) {
        setPermissions({});
      }
    } else {
      setPermissions({});
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  const vehicleItems = [
    {
      id: 'truck',
      title: t("Trucks"),
      icon: <FaTruck />,
      link: "/truck",
    },
    {
      id: 'trailer',
      title: t("Trailers"),
      icon: <FaTrailer />,
      link: "/trailer",
    }
  ];

  const manageItems = [
    {
      id: 'user-management',
      title: t("User Management"),
      icon: <FaUsers />,
      link: "/manage-users",
    },
    {
      id: 'unit-management',
      title: t("Unit Management"),
      icon: <FaTruck />,
      link: "/manage-units",
    },
    {
      id: 'team-management',
      title: t("Team Management"),
      icon: <FaUsers />,
      link: "/manage-teams",
    }
  ];

  const sidebarData = [
    {
      id: 1,
      title: t("Dashboard"),
      icon: <MdSpaceDashboard />,
      link: "/dashboard",
      permission: "dashboard"
    },
    {
      id: 2,
      title: t("Loads"),
      icon: <FaTruckLoading />,
      link: "/loads",
      permission: "loads"
    },
    {
      id: 3,
      title: t("Vehicles"),
      icon: <FaTruck />,
      isDropdown: true,
      items: vehicleItems,
      isOpen: isVehicleOpen,
      toggleDropdown: () => setIsVehicleOpen(!isVehicleOpen),
      permission: "vehicles"
    },
    {
      id: 4,
      title: t("Customer Broker"),
      icon: <FaUserTie />,
      link: "/customer_broker",
      permission: "customer_broker"
    },
    {
      id: 5,
      title: t("Driver"),
      icon: <FaRedRiver />,
      link: "/driver",
      permission: "driver"
    },
    {
      id: 6,
      title: t("Employee"),
      icon: <FaUsers />,
      link: "/employee",
      permission: "employee"
    },
    {
      id: 7,
      title: t("Dispatcher"),
      icon: <FaUserCog />,
      link: "/dispatcher",
      permission: "dispatcher"
    },
    {
      id: 8,
      title: t("Users Actives"),
      icon: <FaUsers />,
      link: "/users-actives",
      permission: "users_actives"
    },
    {
      id: 9,
      title: t("Accounting"),
      icon: <MdAccountBalance />,
      link: "/accounting",
      permission: "accounting"
    },
    {
      id: 10,
      title: t("IFTA"),
      icon: <MdAccountBalance />,
      link: "/ifta",
      permission: "ifta"
    },
    // {kodni 
    //   id: 11,
    //   title: t("Profile"),
    //   icon: <MdOutlineSupervisedUserCircle />,
    //   link: "/profile",
    // },
    {
      id: 12,
      title: t("Manage"),
      icon: <FaUserCog />,
      isDropdown: true,
      items: manageItems,
      isOpen: isManageOpen,
      toggleDropdown: () => setIsManageOpen(!isManageOpen),
      permission: "manage"
    },
  ];

  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar-logo" onClick={toggleSidebar}>
        <img className="logo" src={lightLogo} alt="logo" />
        {isOpen && <h1>TMS</h1>}
      </div>
      <main className="sidebar-content">
        <section className={`sidebar-menu ${isOpen ? "" : "collapsed"}`}>
          {sidebarData.filter(item => permissions[item.permission] === true).map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.id} className="sidebar-dropdown">
                  <div 
                    className={`sidebar-item ${item.isOpen ? 'active' : ''}`}
                    onClick={item.toggleDropdown}
                  >
                    <div className="item-content">
                      <span className="item-icon">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="item-title">{item.title}</span>
                          {item.isOpen ? <MdExpandLess /> : <MdExpandMore />}
                        </>
                      )}
                    </div>
                  </div>
                  {item.isOpen && isOpen && (
                    <div className="dropdown-items">
                      {item.items.map((subItem) => (
                        <NavLink
                          key={subItem.id}
                          to={subItem.link}
                          className={`dropdown-item ${pathname === subItem.link ? 'active' : ''}`}
                        >
                          <span className="item-icon">{subItem.icon}</span>
                          <span className="item-title">{subItem.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.id}
                to={item.link}
                className={`sidebar-item ${pathname === item.link ? 'active' : ''}`}
              >
                <div className="item-content">
                  <span className="item-icon">{item.icon}</span>
                  {isOpen && <span className="item-title">{item.title}</span>}
                </div>
                {pathname === item.link && <div className="active-indicator" />}
              </NavLink>
            );
          })}
        </section>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <IoMdLogOut />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Sidebar;