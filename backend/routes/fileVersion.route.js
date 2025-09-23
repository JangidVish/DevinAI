import express from 'express';
import {
  createFileVersion,
  getFileVersions,
  getFileVersion,
  getLatestFileVersion,
  getFileVersionsByMessage
} from '../controllers/fileVersion.controller.js';

const router = express.Router();

// Create a new file version
router.post('/', createFileVersion);

// Get all versions of a file
router.get('/versions/:projectId/:filePath', getFileVersions);

// Get a specific version of a file
router.get('/version/:versionId', getFileVersion);

// Get the latest version of a file
router.get('/latest/:projectId/:filePath', getLatestFileVersion);

// Get all file versions associated with a message
router.get('/message/:messageId', getFileVersionsByMessage);

// Add these routes to your backend/routes/fileVersion.routes.js

// Get latest version for a specific file
router.get('/file/:filePath/latest', async (req, res) => {
  try {
    const { filePath } = req.params;
    const decodedFilePath = decodeURIComponent(filePath);

    const latestVersion = await FileVersion
      .findOne({ filePath: decodedFilePath })
      .sort({ version: -1, timestamp: -1 })
      .limit(1);

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: 'No versions found for this file'
      });
    }

    res.json({
      success: true,
      data: latestVersion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get latest version of all files for a project
router.get('/project/:projectId/latest', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get all unique file paths for this project
    const uniqueFiles = await FileVersion.distinct('filePath', { projectId });

    const latestVersions = [];

    // Get latest version for each file
    for (const filePath of uniqueFiles) {
      const latestVersion = await FileVersion
        .findOne({ projectId, filePath })
        .sort({ version: -1, timestamp: -1 })
        .limit(1);

      if (latestVersion) {
        latestVersions.push(latestVersion);
      }
    }

    res.json({
      success: true,
      data: latestVersions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all versions for a specific file (existing route - just make sure it exists)
router.get('/file/:filePath', async (req, res) => {
  try {
    const { filePath } = req.params;
    const decodedFilePath = decodeURIComponent(filePath);

    const versions = await FileVersion
      .find({ filePath: decodedFilePath })
      .sort({ version: -1, timestamp: -1 });

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// In your backend fileVersion routes
router.get('/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log('Fetching versions for messageId:', messageId);

    const versions = await FileVersion
      .find({ messageId: messageId })
      .sort({ version: -1, timestamp: -1 });

    console.log(`Found ${versions.length} versions for message ${messageId}`);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error fetching message versions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add this route to your fileVersion routes
router.get('/project/:projectId/all', async (req, res) => {
  try {
    const { projectId } = req.params;

    const allVersions = await FileVersion
      .find({ projectId })
      .sort({ filePath: 1, version: -1, timestamp: -1 });

    res.json({
      success: true,
      data: allVersions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;