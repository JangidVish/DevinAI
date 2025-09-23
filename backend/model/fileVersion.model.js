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
    required: true,
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

const FileVersion = mongoose.model("FileVersion", fileVersionSchema);

export default FileVersion;