const mongoose = require("mongoose");
const File = require("../models/File");
const Folder = require("../models/Folder");
const fs = require("fs/promises");
const path = require("path");

const createFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { folder } = req.body; 
        let folderId = null;

        if (folder) {
            if (!isValidId(folder)) {
                return res.status(400).json({ message: "Invalid folder id" });
            }

            const parent = await Folder.findOne({
                _id: folder,
                owner: req.user._id
            });

            if (!parent) {
                return res.status(404).json({ message: "Folder not found" });
            }

            folderId = parent._id;
        }

        const file = await File.create({
            name: req.file.originalname,
            owner: req.user._id,
            folder: folderId,
            size: req.file.size,
            type: req.file.mimetype,
            path: req.file.path
        });

        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getFile = async (req, res) => {
    try {
        const fileId = req.params.id;
     
         if (!isValidId(fileId)) {
            return res.status(400).json({ message: "Invalid file id" });
        }

        const file = await File.findOne({
            _id: fileId,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.json(file);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        if (!isValidId(fileId)) {
            return res.status(400).json({ message: "Invalid file id" });
        }

        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const result = await File.updateOne(
            { _id: fileId, owner: req.user._id },
            { name: name.trim() }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "File not found" });
        }

        const updated = await File.findById(fileId);
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;

        // 1. Validate file ID
        if (!isValidId(fileId)) {
            return res.status(400).json({
                message: "Invalid file id"
            });
        }

        // 2. Find the file and verify ownership
        const file = await File.findOne({
            _id: fileId,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        // 3. Delete the physical file
        const filePath = path.resolve(file.path);

        try {
            await fs.unlink(filePath);
        } catch (error) {
            // File may already be missing from disk
            if (error.code !== "ENOENT") {
                throw error;
            }
        }

        // 4. Delete the file record from MongoDB
        await File.deleteOne({
            _id: fileId,
            owner: req.user._id
        });

        // 5. Send success response
        res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const moveFile = async (req, res) => {
    try {
        const fileId = req.params.id;

        // 1. Validate file ID
        if (!isValidId(fileId)) {
            return res.status(400).json({
                message: "Invalid file id"
            });
        }

        // 2. Find the file and verify ownership
        const file = await File.findOne({
            _id: fileId,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        // 3. Get target folder from request
        const { folder } = req.body;

        // 4. null means move file to root
        if (folder === null || folder === "") {
            file.folder = null;

            await file.save();

            return res.status(200).json(file);
        }

        // 5. Validate target folder ID
        if (!isValidId(folder)) {
            return res.status(400).json({
                message: "Invalid target folder id"
            });
        }

        // 6. Verify target folder belongs to current user
        const targetFolder = await Folder.findOne({
            _id: folder,
            owner: req.user._id
        });

        if (!targetFolder) {
            return res.status(404).json({
                message: "Target folder not found"
            });
        }

        // 7. Move file
        file.folder = targetFolder._id;

        await file.save();

        res.status(200).json(file);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
module.exports = { createFile, getFile, updateFile, deleteFile, moveFile };
