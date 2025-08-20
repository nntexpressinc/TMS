import React from 'react';
import PermissionDenied from './PermissionDenied';

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

export default PermissionGuard;
