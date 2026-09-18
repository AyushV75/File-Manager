import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Move,
  Upload,
  X,
} from "lucide-react";

import { useFileManager } from "../context/FileManagerContext";
import Breadcrumbs from "../components/BreadCrumbs";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameModal from "../components/RenameModal";
import UploadFile from "../components/UploadFile";
import Navbar from "../components/Navbar";

const FileManager = () => {
  const {
    currentFolder,
    subfolders,
    files,
    allFolders,
    loading,
    error,
    loadRoot,
    loadFolder,
    loadCurrentFolder,
    loadAllFolders,
    folderHistory,
    goBack,
    createFolder,
    renameFolder,
    deleteFolder,
    uploadFile,
    renameFile,
    deleteFile,
    moveFile,
  } = useFileManager();

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [creatingFolder, setcreatingFolder] = useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renamingFolder, setrenamingFolder] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deletingFolder, setdeletingFolder] = useState(false);

  const [fileToRename, setFileToRename] = useState(null);
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [renamingFile, setrenamingFile] = useState(false);

  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deletingFile, setDeletingFile] = useState(false);

  const [moveFileTarget, setMoveFileTarget] = useState(null);
  const [moveBrowseFolder, setMoveBrowseFolder] = useState(null);
  const [moveBreadcrumbs, setMoveBreadcrumbs] = useState([]);
  const [movingFile, setmovingFile] = useState(false);

  const initialLoadStarted = useRef(false);

  useEffect(() => {
    if (initialLoadStarted.current) return;

    initialLoadStarted.current = true;

    const loadInitialData = async () => {
      try {
        await Promise.all([loadRoot(), loadAllFolders()]);
      } catch (error) {
        // Error is handled inside FileManagerContext
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="file-manager">
      <Navbar />

      <main className="file-manager-container">
        {/* Page Header */}
        <header className="file-manager-header">
          <div className="page-title">
            <div className="page-title-icon">
              <FolderOpen size={24} />
            </div>

            <div>
              <h1>My Files</h1>
              <p>Manage your files and folders</p>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="file-manager-navigation">
          <button
            type="button"
            className="navigation-button"
            onClick={goBack}
            disabled={folderHistory.length === 0}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="breadcrumb-wrapper">
            <Breadcrumbs />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading your files...</p>
          </div>
        ) : (
          <>
            {/* Actions */}
            <div className="file-manager-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => setShowCreateFolderModal(true)}
              >
                <Folder size={17} />
                <span>New Folder</span>
              </button>

              <div className="upload-action">
                <UploadFile
                  currentFolder={currentFolder}
                  uploadFile={uploadFile}
                  loading={loading}
                />
              </div>
            </div>

            {/* Folders */}
            <section className="item-list">
              <div className="section-header">
                <div>
                  <h2>Folders</h2>
                  <span className="section-count">
                    {subfolders.length}{" "}
                    {subfolders.length === 1 ? "folder" : "folders"}
                  </span>
                </div>
              </div>

              {subfolders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Folder size={28} />
                  </div>

                  <h3>No folders yet</h3>
                  <p>Create a folder to start organizing your files.</p>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => setShowCreateFolderModal(true)}
                  >
                    <Folder size={16} />
                    Create Folder
                  </button>
                </div>
              ) : (
                <div className="items-grid">
                  {subfolders.map((folder) => (
                    <div key={folder._id} className="folder-item">
                      <button
                        type="button"
                        className="folder-main"
                        onClick={() => loadFolder(folder._id)}
                      >
                        <div className="folder-icon">
                          <Folder size={22} />
                        </div>

                        <div className="folder-name-wrapper">
                          <span className="folder-name">{folder.name}</span>
                          <span className="folder-label">Folder</span>
                        </div>

                        <ChevronRight size={18} className="folder-chevron" />
                      </button>

                      <div className="folder-actions">
                        <button
                          type="button"
                          className="item-menu-button"
                          title="Rename folder"
                          onClick={(event) => {
                            event.stopPropagation();

                            setFolderToRename(folder);
                            setShowRenameModal(true);
                          }}
                        >
                          <Pencil size={15} />
                          <span>Rename</span>
                        </button>

                        <button
                          type="button"
                          className="item-delete-button"
                          title="Delete folder"
                          onClick={(event) => {
                            event.stopPropagation();

                            setFolderToDelete(folder);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Files */}
            <section className="item-list">
              <div className="section-header">
                <div>
                  <h2>Files</h2>
                  <span className="section-count">
                    {files.length} {files.length === 1 ? "file" : "files"}
                  </span>
                </div>
              </div>

              {files.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon file-empty-icon">
                    <FileText size={28} />
                  </div>

                  <h3>No files yet</h3>
                  <p>Upload a file to start using this folder.</p>
                </div>
              ) : (
                <div className="items-grid">
                  {files.map((file) => (
                    <div key={file._id} className="file-item">
                      <div className="file-main">
                        <div className="file-icon">
                          <FileText size={22} />
                        </div>

                        <div className="file-info">
                          <strong title={file.name}>{file.name}</strong>

                          <div className="file-metadata">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{file.type}</span>
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="file-actions">
                        <button
                          type="button"
                          className="item-menu-button"
                          title="Rename file"
                          onClick={(event) => {
                            event.stopPropagation();

                            setFileToRename(file);
                            setShowRenameFileModal(true);
                          }}
                        >
                          <Pencil size={15} />
                          <span>Rename</span>
                        </button>

                        <button
                          type="button"
                          className="item-delete-button"
                          title="Delete file"
                          onClick={(event) => {
                            event.stopPropagation();

                            setFileToDelete(file);
                            setShowDeleteFileModal(true);
                          }}
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>

                        <button
                          type="button"
                          className="item-menu-button"
                          title="Move file"
                          onClick={() => {
                            const fileFolderId =
                              file.folder?._id || file.folder || null;

                            setMoveFileTarget(file);
                            setMoveBrowseFolder(fileFolderId);
                            setMoveBreadcrumbs([]);
                          }}
                        >
                          <Move size={15} />
                          <span>Move</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={showCreateFolderModal}
          onClose={() => {
            if (creatingFolder) return;

            setShowCreateFolderModal(false);
          }}
          onCreate={async (name) => {
            if (creatingFolder) return;

            setcreatingFolder(true);

            try {
              await createFolder(name, currentFolder?._id);

              // Refresh current folder without adding duplicate history
              await loadCurrentFolder();

              // Update folder list used by Move File modal
              await loadAllFolders();

              setShowCreateFolderModal(false);
            } catch (error) {
              // Error is already handled inside FileManagerContext
            } finally {
              setcreatingFolder(false);
            }
          }}
          loading={creatingFolder}
        />

        {/* Rename Folder Modal */}
        <RenameModal
          isOpen={showRenameModal}
          onClose={() => {
            if (renamingFolder) return;
            setShowRenameModal(false);
            setFolderToRename(null);
          }}
          currentName={folderToRename?.name}
          onRename={async (name) => {
            if (!folderToRename) return;

            try {
              setrenamingFolder(true);

              const updatedFolder = await renameFolder(
                folderToRename._id,
                name,
              );

              // Refresh current folder without changing breadcrumb history
              await loadCurrentFolder();

              // Update names used inside Move File modal
              await loadAllFolders();

              // Update copied move breadcrumbs if this folder is present there
              setMoveBreadcrumbs((previousBreadcrumbs) =>
                previousBreadcrumbs.map((folder) =>
                  String(folder._id) === String(updatedFolder._id)
                    ? {
                        ...folder,
                        name: updatedFolder.name,
                      }
                    : folder,
                ),
              );

              setShowRenameModal(false);
              setFolderToRename(null);
            } catch (error) {
              // Error is already handled inside FileManagerContext
            } finally {
              setrenamingFolder(false);
            }
          }}
          loading={renamingFolder}
        />

        {/* Rename File Modal */}
        <RenameModal
          isOpen={showRenameFileModal}
          onClose={() => {
            if (renamingFile) return;
            setShowRenameFileModal(false);
            setFileToRename(null);
          }}
          currentName={fileToRename?.name}
          onRename={async (name) => {
            if (!fileToRename) return;

            try {
              setrenamingFile(true);

              await renameFile(fileToRename._id, name);

              // Refresh current folder without duplicating breadcrumbs
              await loadCurrentFolder();

              setShowRenameFileModal(false);
              setFileToRename(null);
            } catch (error) {
              // Error is already handled inside FileManagerContext
            } finally {
              setrenamingFile(false);
            }
          }}
          loading={renamingFile}
        />

        {/* Delete Folder Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal danger-modal">
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setFolderToDelete(null);
                }}
                disabled={deletingFolder}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="modal-icon danger-icon">
                <Trash2 size={24} />
              </div>

              <h2>Delete Folder</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>"{folderToDelete?.name}"</strong>?
              </p>

              <p className="modal-warning">
                This will permanently delete the folder and all of its nested
                folders and files.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setFolderToDelete(null);
                  }}
                  disabled={deletingFolder}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="danger-action"
                  onClick={async () => {
                    if (deletingFolder || !folderToDelete) return;

                    setdeletingFolder(true);

                    try {
                      await deleteFolder(folderToDelete._id);

                      setShowDeleteModal(false);
                      setFolderToDelete(null);
                    } catch (error) {
                      // Context already stores the error
                    } finally {
                      setdeletingFolder(false);
                    }
                  }}
                  disabled={deletingFolder || !folderToDelete}
                >
                  <Trash2 size={16} />
                  {deletingFolder ? "Deleting..." : "Delete Folder"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete File Modal */}
        {showDeleteFileModal && (
          <div className="modal-overlay">
            <div className="modal danger-modal">
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowDeleteFileModal(false);
                  setFileToDelete(null);
                }}
                disabled={deletingFile}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="modal-icon danger-icon">
                <Trash2 size={24} />
              </div>

              <h2>Delete File</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>"{fileToDelete?.name}"</strong>?
              </p>

              <p className="modal-warning">This action cannot be undone.</p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    setShowDeleteFileModal(false);
                    setFileToDelete(null);
                  }}
                  disabled={deletingFile}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="danger-action"
                  onClick={async () => {
                    if (deletingFile || !fileToDelete) return;

                    setDeletingFile(true);

                    try {
                      await deleteFile(fileToDelete._id);

                      setShowDeleteFileModal(false);
                      setFileToDelete(null);
                    } catch (error) {
                      // Error is already handled inside FileManagerContext
                    } finally {
                      setDeletingFile(false);
                    }
                  }}
                  disabled={deletingFile || !fileToDelete}
                >
                  <Trash2 size={16} />
                  {deletingFile ? "Deleting..." : "Delete File"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move File Modal */}
        {moveFileTarget && (
          <div className="modal-overlay">
            <div className="modal move-modal">
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  if (movingFile) return;

                  setMoveFileTarget(null);
                  setMoveBrowseFolder(null);
                  setMoveBreadcrumbs([]);
                }}
                disabled={movingFile}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="modal-icon move-icon">
                <Move size={24} />
              </div>

              <h2>Move File</h2>

              <p>
                Choose a destination for{" "}
                <strong>"{moveFileTarget.name}"</strong>.
              </p>

              {/* Breadcrumb navigation */}
              <div className="move-breadcrumbs">
                <button
                  type="button"
                  onClick={() => {
                    if (movingFile) return;

                    setMoveBrowseFolder(null);
                    setMoveBreadcrumbs([]);
                  }}
                  disabled={movingFile}
                >
                  Home
                </button>

                {moveBreadcrumbs.map((folder, index) => (
                  <span key={folder._id}>
                    {" / "}

                    <button
                      type="button"
                      onClick={() => {
                        if (movingFile) return;

                        const selectedBreadcrumbs = moveBreadcrumbs.slice(
                          0,
                          index + 1,
                        );

                        setMoveBreadcrumbs(selectedBreadcrumbs);
                        setMoveBrowseFolder(folder._id);
                      }}
                      disabled={movingFile}
                    >
                      {folder.name}
                    </button>
                  </span>
                ))}
              </div>

              {/* Direct child folders */}
              <div className="move-folder-list">
                {allFolders
                  .filter((folder) => {
                    const folderParentId = getParentFolderId(folder);

                    const currentBrowseId = moveBrowseFolder
                      ? String(moveBrowseFolder)
                      : null;

                    return folderParentId === currentBrowseId;
                  })
                  .map((folder) => (
                    <button
                      key={folder._id}
                      type="button"
                      className="move-folder-item"
                      onClick={() => {
                        if (movingFile) return;

                        setMoveBrowseFolder(String(folder._id));

                        setMoveBreadcrumbs((previous) => [
                          ...previous,
                          {
                            _id: String(folder._id),
                            name: folder.name,
                          },
                        ]);
                      }}
                      disabled={movingFile}
                    >
                      <span className="move-folder-icon">
                        <Folder size={18} />
                      </span>

                      <span>{folder.name}</span>

                      <ChevronRight size={17} />
                    </button>
                  ))}

                {allFolders.filter((folder) => {
                  const folderParentId = getParentFolderId(folder);

                  const currentBrowseId = moveBrowseFolder
                    ? String(moveBrowseFolder)
                    : null;

                  return folderParentId === currentBrowseId;
                }).length === 0 && (
                  <div className="empty-move-state">
                    <Folder size={22} />
                    <p>No folders inside this location.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-action"
                  disabled={
                    movingFile ||
                    !moveFileTarget ||
                    String(
                      moveFileTarget.folder?._id ||
                        moveFileTarget.folder ||
                        null,
                    ) === String(moveBrowseFolder)
                  }
                  onClick={async () => {
                    if (movingFile || !moveFileTarget) return;

                    try {
                      setmovingFile(true);

                      await moveFile(moveFileTarget._id, moveBrowseFolder);

                      // Close the modal after successful move
                      setMoveFileTarget(null);
                      setMoveBrowseFolder(null);
                      setMoveBreadcrumbs([]);

                      // Refresh current folder and folder list
                      await loadCurrentFolder();
                      await loadAllFolders();
                    } catch (error) {
                      // Context already stores the error
                    } finally {
                      setmovingFile(false);
                    }
                  }}
                >
                  <Move size={16} />
                  {movingFile ? "Moving..." : "Move here"}
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    if (movingFile || moveBreadcrumbs.length === 0) return;

                    const newBreadcrumbs = moveBreadcrumbs.slice(0, -1);

                    setMoveBreadcrumbs(newBreadcrumbs);

                    setMoveBrowseFolder(
                      newBreadcrumbs.length > 0
                        ? newBreadcrumbs[newBreadcrumbs.length - 1]._id
                        : null,
                    );
                  }}
                  disabled={movingFile || moveBreadcrumbs.length === 0}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    if (movingFile) return;

                    setMoveFileTarget(null);
                    setMoveBrowseFolder(null);
                    setMoveBreadcrumbs([]);
                  }}
                  disabled={movingFile}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const getParentFolderId = (folder) => {
  if (!folder.parentFolder) return null;

  if (typeof folder.parentFolder === "string") {
    return folder.parentFolder;
  }

  if (folder.parentFolder._id) {
    return String(folder.parentFolder._id);
  }

  return null;
};
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export default FileManager;
