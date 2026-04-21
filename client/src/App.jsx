import { useEffect, useState } from "react";
import {
  apiGetFiles,
  apiUploadFiles,
  apiDeleteFiles,
  apiGetFolders,
  apiCreateFolder,
  apiDeleteFolder,
  apiGetFileStats,
  apiGetActivity,
} from "./api";

export default function App() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Initial Load
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [fileData, folderData, statsData, activityData] =
        await Promise.all([
          apiGetFiles(),
          apiGetFolders(),
          apiGetFileStats(),
          apiGetActivity(),
        ]);

      setFiles(fileData.files || []);
      setFolders(folderData.folders || []);
      setStats(statsData || {});
      setActivity(activityData.activity || []);
    } catch (err) {
      console.error("Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload
  const handleUpload = async (e) => {
    try {
      setLoading(true);
      await apiUploadFiles(e.target.files);
      await loadAll();
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete File
  const handleDeleteFile = async (id) => {
    try {
      await apiDeleteFiles([id]);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  // Create Folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await apiCreateFolder(newFolderName);
      setNewFolderName("");
      await loadAll();
    } catch (err) {
      console.error(err.message);
    }
  };

  // Delete Folder
  const handleDeleteFolder = async (id) => {
    try {
      await apiDeleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>☁️ CloudVault Dashboard</h1>

      {/* Upload */}
      <input type="file" multiple onChange={handleUpload} />

      {/* Create Folder */}
      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="New Folder Name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <button onClick={handleCreateFolder}>Create Folder</button>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Stats */}
      {stats && (
        <div style={{ marginTop: 20 }}>
          <h3>📊 Stats</h3>
          <p>Total Files: {stats.total_files || 0}</p>
          <p>Total Size: {stats.total_size || 0}</p>
        </div>
      )}

      {/* Folders */}
      <div style={{ marginTop: 20 }}>
        <h3>📁 Folders</h3>
        <ul>
          {folders.map((folder) => (
            <li key={folder.id}>
              {folder.name}
              <button onClick={() => handleDeleteFolder(folder.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Files */}
      <div style={{ marginTop: 20 }}>
        <h3>📄 Files</h3>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.name}
              <button onClick={() => handleDeleteFile(file.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Activity */}
      <div style={{ marginTop: 20 }}>
        <h3>📜 Activity</h3>
        <ul>
          {activity.map((act, index) => (
            <li key={index}>{act.action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
