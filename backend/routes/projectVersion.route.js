import express from 'express';
import mongoose from 'mongoose';
import ProjectVersion from '../model/projectVersion.model.js';
import FileVersion from '../model/fileVersion.model.js';

const router = express.Router();

// Get all project versions - NO AUTH FOR TESTING
router.get('/project/:projectId/versions', async (req, res) => {
  try {
    console.log('📊 GET /project/:projectId/versions called for:', req.params.projectId);
    const { projectId } = req.params;

    // Ensure proper ObjectId conversion for strict project isolation
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const versions = await ProjectVersion
      .find({ projectId: projectObjectId })
      .sort({ version: -1 })
      .select('-fileTree');

    console.log('📈 Found versions:', versions.length);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('❌ Error fetching project versions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get specific project version with full file tree - NO AUTH FOR TESTING
router.get('/project/:projectId/version/:versionId', async (req, res) => {
  try {
    console.log('🌳 GET /project/:projectId/version/:versionId called');
    const { projectId, versionId } = req.params;

    // Ensure proper ObjectId conversion for strict project isolation
    const projectObjectId = new mongoose.Types.ObjectId(projectId);
    const versionObjectId = new mongoose.Types.ObjectId(versionId);

    const projectVersion = await ProjectVersion.findOne({
      _id: versionObjectId,
      projectId: projectObjectId
    });

    if (!projectVersion) {
      return res.status(404).json({
        success: false,
        message: 'Project version not found'
      });
    }

    console.log('✅ Found project version with fileTree:', Object.keys(projectVersion.fileTree || {}));

    res.json({
      success: true,
      data: projectVersion
    });
  } catch (error) {
    console.error('❌ Error fetching project version:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
