const mongoose = require("mongoose");
const Folder = require("../models/Folder");
const File = require("../models/File");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    let parentId = null;

    if (parentFolder) {
      if (!isValidId(parentFolder)) {
        return res.status(400).json({ message: "Invalid parentFolder id" });
      }

      const parent = await Folder.findOne({
        _id: parentFolder,
        owner: req.user._id,
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent folder not found" });
      }

      parentId = parent._id;
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user._id,
      parentFolder: parentId,
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFolderContents = async (req, res) => {
  try {
    const folderId = req.params.id || null;
    let currentFolder = null;

    if (folderId) {
      if (!isValidId(folderId)) {
        return res.status(400).json({ message: "Invalid folder id" });
      }

      currentFolder = await Folder.findOne({
        _id: folderId,
        owner: req.user._id,
      });

      if (!currentFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const parentFolderQuery = folderId ? currentFolder._id : null;

    const [subfolders, files] = await Promise.all([
      Folder.find({ owner: req.user._id, parentFolder: parentFolderQuery }),
      File.find({ owner: req.user._id, folder: parentFolderQuery }),
    ]);

    res.status(200).json({
      currentFolder,
      subfolders,
      files,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getRootContents = async (req, res) => {
  try {
    const [subfolders, files] = await Promise.all([
      Folder.find({
        owner: req.user._id,
        parentFolder: null,
      }),
      File.find({
        owner: req.user._id,
        folder: null,
      }),
    ]);

    res.status(200).json({
      currentFolder: null,
      subfolders,
      files,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    if (!isValidId(folderId)) {
      return res.status(400).json({
        message: "Invalid folder id",
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Folder name is required",
      });
    }

    const folder = await Folder.findOne({
      _id: folderId,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        message: "Folder not found",
      });
    }

    folder.name = name.trim();

    await folder.save();

    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    // 1. Validate folder ID
    if (!isValidId(folderId)) {
      return res.status(400).json({
        message: "Invalid folder id",
      });
    }

    // 2. Make sure the folder belongs to the logged-in user
    const folder = await Folder.findOne({
      _id: folderId,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        message: "Folder not found",
      });
    }

    // 3. Find all folders inside this folder
    const foldersToDelete = [folder._id];
    let index = 0;

    while (index < foldersToDelete.length) {
      const children = await Folder.find({
        owner: req.user._id,
        parentFolder: foldersToDelete[index],
      }).select("_id");

      for (const child of children) {
        foldersToDelete.push(child._id);
      }

      index++;
    }

    // 4. Find all files inside these folders
    const filesToDelete = await File.find({
      owner: req.user._id,
      folder: { $in: foldersToDelete },
    });

    // 5. Delete physical files from uploads folder
    const fs = require("fs/promises");
    const path = require("path");

    for (const file of filesToDelete) {
      const filePath = path.resolve(file.path);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore if physical file is already missing
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }

    // 6. Delete file documents from MongoDB
    await File.deleteMany({
      _id: { $in: filesToDelete.map((file) => file._id) },
      owner: req.user._id,
    });

    // 7. Delete all folders from MongoDB
    await Folder.deleteMany({
      _id: { $in: foldersToDelete },
      owner: req.user._id,
    });

    // 8. Send response
    res.status(200).json({
      message: "Folder and all nested contents deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      owner: req.user._id,
    }).sort({ name: 1 });

    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createFolder,
  getFolderContents,
  getRootContents,
  updateFolder,
  deleteFolder,
  getAllFolders,
};
