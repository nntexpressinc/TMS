import { ApiService } from "../api/auth";

function encodeToBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

export async function initializeAuthSession(authPayload, options = {}) {
  const { access, refresh, user_id: userId } = authPayload || {};

  if (!access || !refresh || !userId) {
    throw new Error("Authentication payload is missing required tokens");
  }

  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  localStorage.setItem("userid", userId);

  let userData = authPayload.user;

  if (!userData) {
    try {
      userData = await ApiService.getData(`/auth/users/${userId}/`);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    localStorage.setItem("user", JSON.stringify(userData));
  }

  if (userData?.role) {
    try {
      const roleData = await ApiService.getData(`/auth/role/${userData.role}/`);

      if (roleData?.name) {
        const roleNameEnc = encodeToBase64(roleData.name);
        localStorage.setItem("roleNameEnc", roleNameEnc);
        localStorage.removeItem("roleName");
      }

      if (roleData?.permission_id) {
        const permissionData = await ApiService.getData(`/auth/permission/${roleData.permission_id}/`);
        const permissionsEnc = encodeToBase64(JSON.stringify(permissionData));
        localStorage.setItem("permissionsEnc", permissionsEnc);
        localStorage.removeItem("permissions");
      }
    } catch (error) {
      console.error("Error encoding role/permissions:", error);
    }
  }

  const { location, deviceInfo, pageVisibility } = options;

  if (location && deviceInfo && pageVisibility) {
    const additionalData = {
      latitude: location.latitude,
      longitude: location.longitude,
      user: userId,
      device_info: deviceInfo,
      page_status: pageVisibility,
    };

    try {
      await ApiService.postData("/auth/location/", additionalData);
    } catch (error) {
      console.error("Error saving location/device info:", error);
    }
  }

  return { user: userData };
}

export function clearAuthSession() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userid");
    localStorage.removeItem("user");
    localStorage.removeItem("roleName");
    localStorage.removeItem("roleNameEnc");
    localStorage.removeItem("permissions");
    localStorage.removeItem("permissionsEnc");
  } catch (error) {
    console.error("Failed to clear auth session", error);
  }
}
