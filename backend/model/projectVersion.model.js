import mongoose from "mongoose";

const projectVersionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'projects',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  fileTree: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  filesCount: {
    type: Number,
    required: true
  },
  messageId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

projectVersionSchema.index({ projectId: 1, version: -1 });

export default mongoose.model('ProjectVersion', projectVersionSchema);
