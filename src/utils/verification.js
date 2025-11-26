const STORAGE_KEY = "pendingVerification";

export function savePendingVerification(data) {
  if (!data) {
    return;
  }
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Unable to persist pending verification payload", error);
  }
}

export function loadPendingVerification() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return null;
    }
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Unable to parse pending verification payload", error);
    return null;
  }
}

export function clearPendingVerification() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear pending verification payload", error);
  }
}

export function getPendingVerificationStorageKey() {
  return STORAGE_KEY;
}
