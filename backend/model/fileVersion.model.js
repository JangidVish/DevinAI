import mongoose from "mongoose";

const fileVersionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  filePath: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: function () {
      return !this.isDeleted; // Content is required only if file is not deleted
    },
    default: '', // Default to empty string for deleted files
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object,
    default: {},
    // Can include information like:
    // - generatedBy: "AI" or "User"
    // - description: "Initial version", "Bug fix", etc.
    // - language: "javascript", "python", etc.
  }
});

// Create compound index for efficient querying by project and file path
fileVersionSchema.index({ projectId: 1, filePath: 1 });

// Create index for querying by message
fileVersionSchema.index({ messageId: 1 });

// Pre-save middleware to increment version number for existing files
fileVersionSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Find the latest version for this file path in this project
      const latestFile = await this.constructor.findOne({
        projectId: this.projectId,
        filePath: this.filePath
      }).sort({ version: -1 });

      if (latestFile) {
        // If file exists, increment version
        this.version = latestFile.version + 1;
        console.log(`📈 Incrementing version for ${this.filePath}: v${latestFile.version} → v${this.version}`);
      } else {
        // If it's a new file, version starts at 1
        this.version = 1;
        console.log(`🆕 New file ${this.filePath}: v${this.version}`);
      }
    } catch (error) {
      console.error('Error in FileVersion pre-save middleware:', error);
      // Continue with default version if there's an error
    }
  }
  next();
});

const FileVersion = mongoose.model("FileVersion", fileVersionSchema);

export default FileVersion;