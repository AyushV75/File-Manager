const User = require("../models/User");
const Folder = require("../models/Folder");
const File = require("../models/File");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
};

const getAllFolders = async (req, res) => {
    try {
        const folders = await Folder.find()
            .populate("owner", "email")
            .sort({ createdAt: -1 });

        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch folders",
        });
    }
};
const getAllFiles = async (req, res) => {
    try {
        const files = await File.find()
            .populate("owner", "email")
            .populate("folder", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch files",
        });
    }
};
const moveFileAsAdmin = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { destinationUserId, destinationFolderId } = req.body;

    // Find the file
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        message: "File not found.",
      });
    }

    // Find destination user
    const destinationUser = await User.findById(destinationUserId);

    if (!destinationUser) {
      return res.status(404).json({
        message: "Destination user not found.",
      });
    }

    // If moving into a folder, verify that the folder
    // belongs to the destination user.
    if (destinationFolderId) {
      const destinationFolder = await Folder.findOne({
        _id: destinationFolderId,
        owner: destinationUserId,
      });

      if (!destinationFolder) {
        return res.status(404).json({
          message: "Destination folder not found.",
        });
      }
    }

    // Update ownership and folder
    file.owner = destinationUserId;
    file.folder = destinationFolderId || null;

    await file.save();

    return res.status(200).json(file);
  } catch (error) {
    console.error("Admin move file error:", error);

    return res.status(500).json({
      message: "Failed to move file.",
    });
  }
};

module.exports = {
    getAllUsers,
    getAllFolders,
    getAllFiles,
    moveFileAsAdmin,
};