import mongoose from 'mongoose';
import FileVersion from '../model/fileVersion.model.js';
// Create a new file version
export const createFileVersion = async (req, res) => {
  try {
    const { projectId, fileName, filePath, content, messageId, metadata } = req.body;

    // Convert projectId to ObjectId for strict project isolation
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Find the latest version number for this file
    const latestVersion = await FileVersion.findOne(
      { projectId: projectObjectId, filePath },
      { version: 1 },
      { sort: { version: -1 } }
    );

    const version = latestVersion ? latestVersion.version + 1 : 1;

    const newFileVersion = new FileVersion({
      projectId: projectObjectId,
      fileName,
      filePath,
      content,
      version,
      messageId,
      metadata
    });

    await newFileVersion.save();

    res.status(201).json({
      success: true,
      data: newFileVersion
    });
  } catch (error) {
    console.error('Error creating file version:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create file version',
      error: error.message
    });
  }
};
// Get all versions of a file
export const getFileVersions = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const decodedFilePath = decodeURIComponent(filePath);

    // Convert projectId to ObjectId for strict project isolation
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const fileVersions = await FileVersion.find(
      { projectId: projectObjectId, filePath: decodedFilePath },
      {},
      { sort: { version: -1 } }
    );

    res.status(200).json({
      success: true,
      count: fileVersions.length,
      data: fileVersions
    });
  } catch (error) {
    console.error('Error fetching file versions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file versions',
      error: error.message
    });
  }
};
// Get a specific version of a file
export const getFileVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const fileVersion = await FileVersion.findById(versionId);

    if (!fileVersion) {
      return res.status(404).json({
        success: false,
        message: 'File version not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fileVersion
    });
  } catch (error) {
    console.error('Error fetching file version:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file version',
      error: error.message
    });
  }
};
// Get the latest version of a file
export const getLatestFileVersion = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const decodedFilePath = decodeURIComponent(filePath);

    // Convert projectId to ObjectId for strict project isolation
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const latestVersion = await FileVersion.findOne(
      { projectId: projectObjectId, filePath: decodedFilePath, isDeleted: { $ne: true } },
      {},
      { sort: { version: -1 } }
    );

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: 'No active versions found for this file (file may have been deleted)'
      });
    }

    res.status(200).json({
      success: true,
      data: latestVersion
    });
  } catch (error) {
    console.error('Error fetching latest file version:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest file version',
      error: error.message
    });
  }
};
// Get all file versions associated with a message
export const getFileVersionsByMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const fileVersions = await FileVersion.find({ messageId });

    res.status(200).json({
      success: true,
      count: fileVersions.length,
      data: fileVersions
    });
  } catch (error) {
    console.error('Error fetching file versions by message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file versions by message',
      error: error.message
    });
  }
};
