import { createContext, useContext, useState } from "react";
import api from "../services/api";

const FileManagerContext = createContext();

export const FileManagerProvider = ({ children }) => {
    const [currentFolder, setCurrentFolder] = useState(null);
    const [subfolders, setSubfolders] = useState([]);
    const[ allFolders, setAllFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [folderHistory, setFolderHistory] = useState([]);
    


    // Load root folder
    const loadRoot = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/folder");

            setCurrentFolder(response.data.currentFolder);
            setSubfolders(response.data.subfolders);
            setFiles(response.data.files);
            setFolderHistory([]);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load files and folders."
            );
        } finally {
            setLoading(false);
        }
    };

    // Open a folder
    const loadFolder = async (folderId) => {
    try {
        setLoading(true);
        setError("");

        const response = await api.get(`/folder/${folderId}`);

        // Save the current location before moving into the new folder.
        setFolderHistory((previousHistory) => [
            ...previousHistory,
            currentFolder
        ]);

        setCurrentFolder(response.data.currentFolder);
        setSubfolders(response.data.subfolders);
        setFiles(response.data.files);
    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to load folder."
        );
    } finally {
        setLoading(false);
    }
};
const navigateToBreadcrumb = async (folderId, historyIndex) => {
    try {
        setLoading(true);
        setError("");

        // Going back to Home
        if (folderId === null) {
            await loadRoot();
            return;
        }

        const response = await api.get(`/folder/${folderId}`);

        setCurrentFolder(response.data.currentFolder);
        setSubfolders(response.data.subfolders);
        setFiles(response.data.files);

        // Keep only the folders before the selected breadcrumb.
        setFolderHistory((previousHistory) =>
            previousHistory.slice(0, historyIndex)
        );
    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to navigate to folder."
        );
    } finally {
        setLoading(false);
    }
};

    // Go back to previous folder
    const goBack = async () => {
        try {
            setLoading(true);
            setError("");

            if (folderHistory.length === 0) {
                await loadRoot();
                return;
            }

            const previousFolder =
                folderHistory[folderHistory.length - 1];

            setFolderHistory((previousHistory) =>
                previousHistory.slice(0, -1)
            );

            if (!previousFolder) {
                await loadRoot();
                return;
            }

            const response = await api.get(
                `/folder/${previousFolder._id}`
            );

            setCurrentFolder(response.data.currentFolder);
            setSubfolders(response.data.subfolders);
            setFiles(response.data.files);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to go back."
            );
        } finally {
            setLoading(false);
        }
    };

    // Create folder
    const createFolder = async (name, parentFolder = null) => {
        try {
            setError("");

            const response = await api.post("/folder", {
                name,
                parentFolder
            });

            setSubfolders((previousFolders) => [
                ...previousFolders,
                response.data
            ]);

            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to create folder."
            );

            throw error;
        }
    };

    // Rename folder
    const renameFolder = async (folderId, name) => {
        try {
            setError("");

            const response = await api.put(
                `/folder/${folderId}`,
                { name }
            );

            setSubfolders((previousFolders) =>
                previousFolders.map((folder) =>
                    folder._id === folderId
                        ? response.data
                        : folder
                )
            );

            if (currentFolder?._id === folderId) {
                setCurrentFolder(response.data);
            }

            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to rename folder."
            );

            throw error;
        }
    };

    // Delete folder
    const deleteFolder = async (folderId) => {
    try {
        setError("");

        await api.delete(`/folder/${folderId}`);

        setSubfolders((previousFolders) =>
            previousFolders.filter(
                (folder) => folder._id !== folderId
            )
        );
    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to delete folder."
        );

        throw error;
    }
};

    // Upload file
    const uploadFile = async (file, folder = null) => {
        try {
            setError("");

            const formData = new FormData();

            formData.append("file", file);

            if (folder) {
                formData.append("folder", folder);
            }

            const response = await api.post("/file", formData);

            setFiles((previousFiles) => [
                ...previousFiles,
                response.data
            ]);

            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to upload file."
            );

            throw error;
        }
    };

    // Rename file
    const renameFile = async (fileId, name) => {
        try {
            setError("");

            const response = await api.put(
                `/file/${fileId}`,
                { name }
            );

            setFiles((previousFiles) =>
                previousFiles.map((file) =>
                    file._id === fileId
                        ? response.data
                        : file
                )
            );

            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to rename file."
            );

            throw error;
        }
    };

    // Delete file
    const deleteFile = async (fileId) => {
        try {
            setError("");

            await api.delete(`/file/${fileId}`);

            setFiles((previousFiles) =>
                previousFiles.filter(
                    (file) => file._id !== fileId
                )
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete file."
            );

            throw error;
        }
    };
    ;

    // Move file
    const moveFile = async (fileId, folder = null) => {
        try {
            setError("");

            const response = await api.put(
                `/file/${fileId}/move`,
                { folder }
            );

            // If the file was moved out of the current folder,
            // remove it from the current UI.
            setFiles((previousFiles) =>
                previousFiles.filter(
                    (file) => file._id !== fileId
                )
            );

            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to move file."
            );

            throw error;
        }
    };

    // Reload whichever folder is currently open
    const loadCurrentFolder = async () => {
        if (!currentFolder) {
            await loadRoot();
            return;
        }

        const response = await api.get(
            `/folder/${currentFolder._id}`
        );

        setCurrentFolder(response.data.currentFolder);
        setSubfolders(response.data.subfolders);
        setFiles(response.data.files);
    };
    const loadAllFolders = async () => {
    try {
        setError("");

        const response = await api.get("/folder/all");

        setAllFolders(response.data);

        return response.data;
    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to load folders."
        );
        throw error;
    }
}

    return (
        <FileManagerContext.Provider
            value={{
                currentFolder,
                subfolders,
                files,
                allFolders,
                loading,
                error,
                folderHistory,

                loadRoot,
                loadFolder,
                loadAllFolders,
                navigateToBreadcrumb,
                goBack,

                createFolder,
                renameFolder,
                deleteFolder,
                loadCurrentFolder,

                uploadFile,
                renameFile,
                deleteFile,
                moveFile
            }}
        >
            {children}
        </FileManagerContext.Provider>
    );
};

export const useFileManager = () => {
    const context = useContext(FileManagerContext);

    if (!context) {
        throw new Error(
            "useFileManager must be used within a FileManagerProvider"
        );
    }

    return context;
};