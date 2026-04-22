import { useEffect, useState } from "react";
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiGetFiles,
  apiUploadFiles,
  apiDeleteFiles,
} from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🔹 Load user on refresh
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await apiGetMe();
      setUser(data.user);
      loadFiles();
    } catch {
      setUser(null);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await apiGetFiles();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Auth
  const handleAuth = async () => {
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await apiLogin(email, password);
      } else {
        res = await apiRegister(name, email, password);
      }

      localStorage.setItem("cloudvault_token", res.token);
      await loadUser();
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("cloudvault_token");
    setUser(null);
    setFiles([]);
  };

  // 🔹 Upload
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      await apiUploadFiles(files);
      loadFiles();
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    try {
      await apiDeleteFiles([id]);
      loadFiles();
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================
  // 🔐 AUTH UI (UNCHANGED STYLE)
  // ==========================
  if (!user) {
    return (
      <div className="container">
        <h1>CloudVault</h1>

        {!isLogin && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleAuth} disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>

        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
          {isLogin ? "Create account" : "Already have account?"}
        </p>
      </div>
    );
  }

  // ==========================
  // 📁 DASHBOARD UI (SAME LOOK)
  // ==========================
  return (
    <div className="container">
      <h1>Welcome, {user.name}</h1>

      <button onClick={logout}>Logout</button>

      <input type="file" multiple onChange={handleUpload} />

      <h2>Your Files</h2>

      {files.length === 0 && <p>No files uploaded</p>}

      <ul>
        {files.map((file) => (
          <li key={file.id}>
            {file.name}
            <button onClick={() => handleDelete(file.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
