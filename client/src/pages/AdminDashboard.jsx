import { useEffect, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  LogOut,
  Move,
  Shield,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}/admin`;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState([]);
  

  // =========================
  // Admin Move State
  // =========================

  const [moveFile, setMoveFile] = useState(null);
  const [moveDestinationUser, setMoveDestinationUser] = useState(null);
  const [moveBrowseFolder, setMoveBrowseFolder] = useState(null);
  const [moveBreadcrumbs, setMoveBreadcrumbs] = useState([]);
  const [isMoving, setIsMoving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");


  // =================================================
  // Refreshing the Admin Dashboard every 5 seconds
  // =================================================


  const fetchAdminData = useCallback(async (isInitialLoad = false) => {
    try {
        if (isInitialLoad) {
            setLoading(true);
        }

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found.");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const [usersResponse, foldersResponse, filesResponse] =
            await Promise.all([
                fetch(`${API_URL}/users`, { headers }),
                fetch(`${API_URL}/folders`, { headers }),
                fetch(`${API_URL}/files`, { headers }),
            ]);

        if (
            !usersResponse.ok ||
            !foldersResponse.ok ||
            !filesResponse.ok
        ) {
            throw new Error("Failed to load admin data.");
        }

        const usersData = await usersResponse.json();
        const foldersData = await foldersResponse.json();
        const filesData = await filesResponse.json();

        setUsers(usersData);
        setFolders(foldersData);
        setFiles(filesData);

        setError("");
    } catch (error) {
        setError(error.message);
    } finally {
        if (isInitialLoad) {
            setLoading(false);
        }
    }
}, []);

  // =========================
  // Load Admin Data
  // =========================

  useEffect(() => {
  // Initial load
  fetchAdminData(true);

  // Background refresh every 5 seconds
  const intervalId = setInterval(() => {
    fetchAdminData(false);
  }, 5000);

  // Stop polling when leaving Admin Dashboard
  return () => {
    clearInterval(intervalId);
  };
}, [fetchAdminData]);

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // Helpers
  // =========================

  const getOwnerId = (owner) => {
    if (!owner) {
      return null;
    }

    if (typeof owner === "object") {
      return String(owner._id);
    }

    return String(owner);
  };

  const getParentFolderId = (folder) => {
    if (!folder.parentFolder) {
      return null;
    }

    if (typeof folder.parentFolder === "string") {
      return String(folder.parentFolder);
    }

    if (folder.parentFolder._id) {
      return String(folder.parentFolder._id);
    }

    return null;
  };

  const getFileFolderId = (file) => {
    if (!file.folder) {
      return null;
    }

    if (typeof file.folder === "object") {
      return String(file.folder._id);
    }

    return String(file.folder);
  };

  const formatFileSize = (size) => {
    if (!size || size === 0) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB", "TB"];

    const index = Math.floor(Math.log(size) / Math.log(1024));

    return `${parseFloat(
      (size / Math.pow(1024, index)).toFixed(2),
    )} ${units[index]}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString();
  };

  // =========================
  // User Navigation
  // =========================

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedFolder(null);
    setFolderBreadcrumbs([]);
  };

  const handleAdminBack = () => {
    // Currently inside a folder
    if (selectedFolder) {
      if (folderBreadcrumbs.length > 1) {
        // Go back to the previous folder
        const newBreadcrumbs = folderBreadcrumbs.slice(0, -1);

        setFolderBreadcrumbs(newBreadcrumbs);

        const parentFolderId = newBreadcrumbs[newBreadcrumbs.length - 1]._id;

        const parentFolder = folders.find(
          (folder) => String(folder._id) === String(parentFolderId),
        );

        setSelectedFolder(parentFolder || null);
      } else {
        // We were inside a root folder
        setSelectedFolder(null);
        setFolderBreadcrumbs([]);
      }

      return;
    }

    // At Home/root → go back to Users
    setSelectedUser(null);
    setFolderBreadcrumbs([]);
  };

  // =========================
  // Folder Navigation 
  // =========================

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);

    setFolderBreadcrumbs((previous) => [
      ...previous,
      {
        _id: String(folder._id),
        name: folder.name,
      },
    ]);
  };

  const handleBreadcrumbClick = (folder, index) => {
    setSelectedFolder(folder);

    setFolderBreadcrumbs(folderBreadcrumbs.slice(0, index + 1));
  };

  const handleHomeClick = () => {
    setSelectedFolder(null);
    setFolderBreadcrumbs([]);
  };

  // =========================
  // Selected User Folders
  // =========================

  const selectedUserFolders = selectedUser
    ? folders.filter((folder) => {
        if (getOwnerId(folder.owner) !== String(selectedUser._id)) {
          return false;
        }

        const parentId = getParentFolderId(folder);

        const currentFolderId = selectedFolder
          ? String(selectedFolder._id)
          : null;

        return parentId === currentFolderId;
      })
    : [];

  // =========================
  // Selected User Files
  // =========================
                             
  const selectedUserFiles = selectedUser
    ? files.filter((file) => {
        if (getOwnerId(file.owner) !== String(selectedUser._id)) {
          return false;
        }

        const fileFolderId = getFileFolderId(file);

        const currentFolderId = selectedFolder
          ? String(selectedFolder._id)
          : null;

        return fileFolderId === currentFolderId;
      })
    : [];

  // =========================
  // Start Admin Move
  // =========================

  const handleMoveClick = (file) => {
    setMoveFile(file);
    setMoveDestinationUser(null);
    setMoveBrowseFolder(null);
    setMoveBreadcrumbs([]);
  };

  // =========================
  // Move Navigation
  // =========================

  const handleMoveFolderClick = (folder) => {
    setMoveBrowseFolder(String(folder._id));

    setMoveBreadcrumbs((previous) => [
      ...previous,
      {
        _id: String(folder._id),
        name: folder.name,
      },
    ]);
  };

  const handleMoveHomeClick = () => {
    setMoveBrowseFolder(null);
    setMoveBreadcrumbs([]);
  };

  const handleMoveBreadcrumbClick = (folder, index) => {
    setMoveBrowseFolder(String(folder._id));

    setMoveBreadcrumbs(moveBreadcrumbs.slice(0, index + 1));
  };

  const handleMoveBack = () => {
    if (moveBreadcrumbs.length === 0) {
      return;
    }

    const newBreadcrumbs = moveBreadcrumbs.slice(0, -1);

    setMoveBreadcrumbs(newBreadcrumbs);

    setMoveBrowseFolder(
      newBreadcrumbs.length > 0
        ? newBreadcrumbs[newBreadcrumbs.length - 1]._id
        : null,
    );
  };

  // =========================
  // Destination Folders
  // =========================

  const moveFolders = moveDestinationUser
    ? folders.filter((folder) => {
        if (getOwnerId(folder.owner) !== String(moveDestinationUser._id)) {
          return false;
        }

        const parentId = getParentFolderId(folder);

        return (
          parentId === (moveBrowseFolder ? String(moveBrowseFolder) : null)
        ); 
      })
    : [];

  // =========================
  // Admin Move
  // =========================

  const handleAdminMove = async () => {
    if (isMoving) {
      return;
    }

    if (!moveFile || !moveDestinationUser) {
      return;
    }

    try {
      setIsMoving(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/files/${moveFile._id}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destinationUserId: moveDestinationUser._id,

          destinationFolderId: moveBrowseFolder || null,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Admin move API returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to move file.");
      }

      setFiles((previousFiles) =>
        previousFiles.map((file) =>
          String(file._id) === String(moveFile._id) ? data : file,
        ),
      );

      setMoveFile(null);
      setMoveDestinationUser(null);
      setMoveBrowseFolder(null);
      setMoveBreadcrumbs([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsMoving(false);
    }
  };
  const handleBackToUsers = () => {
    setSelectedUser(null);
    setSelectedFolder(null);
    setFolderBreadcrumbs([]);
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error && !selectedUser) {
    return <div className="error-message">{error}</div>;
  }

  // =========================
  // MOVE VIEW
  // =========================

  if (moveFile) {
    return (
      <div className="file-manager">
        <div className="file-manager-container">
          <div className="file-manager-header">
            <div className="page-title">
              <div className="page-title-icon">
                <Move size={26} />
              </div>

              <div>
                <h1>Move File</h1>

                <p>Move "{moveFile.name}"</p>  
              </div>
            </div>
          </div>

          {!moveDestinationUser ? (
            <div className="admin-move-container">
              <button
                type="button"
                className="navigation-button"
                onClick={() => {
                  setMoveFile(null);
                  setMoveDestinationUser(null);
                  setMoveBrowseFolder(null);
                  setMoveBreadcrumbs([]);
                }}
              >
                <ArrowLeft size={17} />
                Cancel
              </button>

              <div className="admin-move-section">
                <div className="section-header">
                  <h2>Select destination user</h2>
                </div>

                <div className="items-grid">
                  {users.map((user) => (
                    <div key={user._id} className="folder-item">
                      <button
                        type="button"
                        className="folder-main"
                        onClick={() => {
                          setMoveDestinationUser(user);
                          setMoveBrowseFolder(null);
                          setMoveBreadcrumbs([]);
                        }}
                      >
                        <div className="folder-icon">
                          <Folder size={21} />
                        </div>

                        <div className="folder-name-wrapper">
                          <span className="folder-name">{user.email}</span>

                          <span className="folder-label">{user.role}</span>
                        </div>

                        <ChevronRight size={19} className="folder-chevron" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="file-manager-navigation">
                <button
                  type="button"
                  className="navigation-button"
                  onClick={() => {
                    setMoveDestinationUser(null);
                    setMoveBrowseFolder(null);
                    setMoveBreadcrumbs([]);
                  }}
                  disabled={isMoving}
                >
                  <ArrowLeft size={17} />
                  Change User
                </button>

                <div className="breadcrumb-wrapper">
                  <div className="breadcrumbs">
                    <button
                      type="button"
                      className="breadcrumb-item"
                      onClick={handleMoveHomeClick}
                      disabled={isMoving}
                    >
                      Home
                    </button>

                    {moveBreadcrumbs.map((folder, index) => (
                      <span key={folder._id}>
                        {" / "}

                        <button
                          type="button"
                          className="breadcrumb-item"
                          onClick={() =>
                            handleMoveBreadcrumbClick(folder, index)
                          }
                          disabled={isMoving}
                        >
                          {folder.name}
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-move-user">
                <Shield size={17} />
                Destination user: <strong>{moveDestinationUser.email}</strong>
              </div>

              <div className="item-list">
                <div className="section-header">
                  <div>
                    <h2>Folders</h2>

                    <span className="section-count">
                      {moveFolders.length} folders
                    </span>
                  </div>
                </div>

                <div className="items-grid">
                  {moveFolders.map((folder) => (
                    <div key={folder._id} className="folder-item">
                      <button
                        type="button"
                        className="folder-main"
                        onClick={() => handleMoveFolderClick(folder)}
                        disabled={isMoving}
                      >
                        <div className="folder-icon">
                          <Folder size={21} />
                        </div>

                        <div className="folder-name-wrapper">
                          <span className="folder-name">{folder.name}</span>

                          <span className="folder-label">Folder</span>
                        </div>

                        <ChevronRight size={19} className="folder-chevron" />
                      </button>
                    </div>
                  ))}

                  {moveFolders.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FolderOpen size={24} />
                      </div>

                      <h3>No folders here</h3>

                      <p>You can move the file to this location.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-move-actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={handleAdminMove}
                  disabled={
                    isMoving ||
                    (String(getFileFolderId(moveFile)) ===
                      String(moveBrowseFolder) &&
                      getOwnerId(moveFile.owner) ===
                        String(moveDestinationUser._id))
                  }
                >
                  <Move size={17} />

                  {isMoving ? "Moving..." : "Move here"}
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={handleMoveBack}
                  disabled={isMoving || moveBreadcrumbs.length === 0}
                >
                  <ArrowLeft size={17} />
                  Back
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    if (isMoving) {
                      return;
                    }

                    setMoveFile(null);
                    setMoveDestinationUser(null);
                    setMoveBrowseFolder(null);
                    setMoveBreadcrumbs([]);
                  }}
                  disabled={isMoving}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // USERS VIEW
  // =========================

  if (!selectedUser) {
    return (
      <div className="admin-dashboard"> 
        <div className="admin-dashboard-inner">
          <div className="admin-header">
            <div>
              <div className="admin-title-row">
                <div className="admin-title-icon">
                  <Shield size={25} />
                </div>

                <div>
                  <h1>Admin Dashboard</h1>

                  <p>Logged in as: {storedUser?.email}</p>
                </div>
              </div>
            </div>

            <div className="admin-actions">
              <button
                onClick={() => navigate("/app")}
                className="admin-file-manager-button"
              >
                <FolderOpen size={24} />
                File Manager
              </button>

              <button onClick={handleLogout} className="admin-logout-button">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <div className="admin-summary">
            <div className="admin-card">
              <h2>Total Users</h2>
              <p>{users.length}</p>
            </div>

            <div className="admin-card">
              <h2>Total Folders</h2>
              <p>{folders.length}</p>
            </div>

            <div className="admin-card">
              <h2>Total Files</h2>
              <p>{files.length}</p>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-section">
              <div className="section-header">
                <div>
                  <h2>Users</h2>

                  <span className="section-count">{users.length} users</span>
                </div>
              </div>

              <div className="items-grid">
                {users.map((user) => (
                  <div key={user._id} className="folder-item">
                    <button
                      type="button"
                      className="folder-main"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="folder-icon">
                        <Folder size={21} />
                      </div>

                      <div className="folder-name-wrapper">
                        <span className="folder-name">{user.email}</span>

                        <span className="folder-label">{user.role}</span>
                      </div>

                      <ChevronRight size={19} className="folder-chevron" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // SELECTED USER FILE MANAGER
  // =========================

  return (
    <div className="file-manager">
      <div className="file-manager-container">
        {/* =========================
                    Header
        ========================= */}

        <div className="file-manager-header">
          <div className="page-title">
            <div className="page-title-icon">
              <FolderOpen size={27} />
            </div>

            <div>
              <h1 onClick={handleBackToUsers}>My Files</h1>

              <p>{selectedUser.email}</p>
            </div>
          </div>
        </div>

        {/* =========================
                 Navigation
        ========================= */}

        <div className="file-manager-navigation">
          <button
            type="button"
            className="navigation-button"
            onClick={handleAdminBack}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="breadcrumb-wrapper">
            <div className="breadcrumbs">
              <button
                type="button"
                className="breadcrumb-item"
                onClick={handleHomeClick}
              >
                Home
              </button>

              {folderBreadcrumbs.map((folder, index) => (
                <span key={folder._id}>
                  {" / "}

                  <button
                    type="button"
                    className="breadcrumb-item"
                    onClick={() => handleBreadcrumbClick(folder, index)}
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* =========================
                 Admin Info
        ========================= */}

        <div className="admin-selected-user">
          <Shield size={16} />

          <span>Viewing:</span>

          <strong>{selectedUser.email}</strong>

          <span>({selectedUser.role})</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* =========================
                  Folders
        ========================= */}

        <div className="item-list">
          <div className="section-header">
            <div>
              <h2>Folders</h2>

              <span className="section-count">
                {selectedUserFolders.length}{" "}
                {selectedUserFolders.length === 1 ? "folder" : "folders"}
              </span>
            </div>
          </div>

          <div className="items-grid">
            {selectedUserFolders.map((folder) => (
              <div key={folder._id} className="folder-item">
                <button
                  type="button"
                  className="folder-main"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="folder-icon">
                    <Folder size={22} />
                  </div>

                  <div className="folder-name-wrapper">
                    <span className="folder-name">{folder.name}</span>

                    <span className="folder-label">Folder</span>
                  </div>

                  <ChevronRight size={20} className="folder-chevron" />
                </button>
              </div>
            ))}

            {selectedUserFolders.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FolderOpen size={24} />
                </div>

                <h3>No folders here</h3>

                <p>This folder does not contain any subfolders.</p>
              </div>
            )}
          </div>
        </div>

        {/* =========================
                    Files
        ========================= */}

        <div className="item-list">
          <div className="section-header">
            <div>
              <h2>Files</h2>

              <span className="section-count">
                {selectedUserFiles.length}{" "}
                {selectedUserFiles.length === 1 ? "file" : "files"}
              </span>
            </div>
          </div>

          <div className="items-grid">
            {selectedUserFiles.map((file) => (
              <div key={file._id} className="file-item">
                <div className="file-main">
                  <div className="file-icon">
                    <FileText size={21} />
                  </div>

                  <div className="file-info">
                    <strong>{file.name}</strong>

                    <div className="file-metadata">
                      <span>{formatFileSize(file.size)}</span>

                      <span>
                        {file.mimetype || file.type || "Unknown type"}
                      </span>

                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="file-actions">
                  <button
                    type="button"
                    className="item-menu-button"
                    onClick={() => handleMoveClick(file)}
                  >
                    <Move size={17} />
                    Move
                  </button>
                </div>
              </div>
            ))}

            {selectedUserFiles.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon file-empty-icon">
                  <FileText size={24} />
                </div>

                <h3>No files here</h3>

                <p>This folder does not contain any files.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
