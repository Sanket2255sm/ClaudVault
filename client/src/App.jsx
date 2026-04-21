// ============================================
// CloudVault Frontend API Layer
// ============================================

// 🔥 Use environment variable (BEST PRACTICE)
const API_BASE = import.meta.env.VITE_API_URL || "https://claudvault.onrender.com";

// 👉 Final API URL
const API = `${API_BASE}/api`;

// ---- Helper: get token ----
const getToken = () => localStorage.getItem("cloudvault_token");

// ---- Helper: headers ----
const getHeaders = (isJSON = true) => {
  const headers = {};
  if (isJSON) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ---- Helper: handle response ----
const handleResponse = async (res) => {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (err) {
    throw new Error(text || "Invalid response from server");
  }
};

// ============================================
// AUTH
// ============================================

export const apiRegister = async (name, email, password) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
};

export const apiLogin = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const apiGetMe = async () => {
  const res = await fetch(`${API}/auth/me`, {
    headers: getHeaders(false),
  });
  return handleResponse(res);
};

// ============================================
// FILES
// ============================================

export const apiGetFiles = async () => {
  const res = await fetch(`${API}/files`, {
    headers: getHeaders(false),
  });
  return handleResponse(res);
};

export const apiUploadFiles = async (files, folderId = null) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  if (folderId) formData.append("folder_id", folderId);

  const res = await fetch(`${API}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  return handleResponse(res);
};

export const apiDeleteFiles = async (ids) => {
  const res = await fetch(`${API}/files`, {
    method: "DELETE",
    headers: getHeaders(),
    body: JSON.stringify({ ids }),
  });
  return handleResponse(res);
};

export const apiRenameFile = async (id, name) => {
  const res = await fetch(`${API}/files/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
};

export const apiStarFile = async (id) => {
  const res = await fetch(`${API}/files/${id}/star`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const apiMoveFile = async (id, folderId) => {
  const res = await fetch(`${API}/files/${id}/move`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ folder_id: folderId }),
  });
  return handleResponse(res);
};

// ============================================
// FILE DOWNLOAD / PREVIEW
// ============================================

export const apiFetchFileBlob = async (id) => {
  const res = await fetch(`${API}/files/${id}/download`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch file");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const getDownloadUrl = (id) => {
  return `${API}/files/${id}/download?token=${getToken()}`;
};

export const getViewUrl = (userId, fileName) => {
  return `${API}/uploads/${userId}/${fileName}?token=${getToken()}`;
};

export const apiGetFileStats = async () => {
  const res = await fetch(`${API}/files/stats`, {
    headers: getHeaders(false),
  });
  return handleResponse(res);
};

// ============================================
// FOLDERS
// ============================================

export const apiGetFolders = async () => {
  const res = await fetch(`${API}/folders`, {
    headers: getHeaders(false),
  });
  return handleResponse(res);
};

export const apiCreateFolder = async (name) => {
  const res = await fetch(`${API}/folders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
};

export const apiDeleteFolder = async (id) => {
  const res = await fetch(`${API}/folders/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ============================================
// PREFERENCES
// ============================================

export const apiGetPreferences = async () => {
  const res = await fetch(`${API}/preferences`, {
    headers: getHeaders(false),
  });
  return handleResponse(res);
};

export const apiUpdatePreferences = async (prefs) => {
  const res = await fetch(`${API}/preferences`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(prefs),
  });
  return handleResponse(res);
};

// ============================================
// ACTIVITY
// ============================================

export const apiGetActivity = async (limit = 20) => {
  const res = await fetch(`${API}/activity?limit=${limit}`, {
    headers: getHeaders(false),
  });
  return handleResponse(res);
};
