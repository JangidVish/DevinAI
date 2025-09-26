import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProjectVersion from './model/projectVersion.model.js';
import FileVersion from './model/fileVersion.model.js';
import Project from './model/project.model.js';
import Message from './model/message.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas using your .env URI
const connectDB = async () => {
  try {
    // Use the same connection logic as your main app
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_URL || process.env.DB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

async function cleanupOrphanedData() {
  try {
    // Connect to database first
    await connectDB();

    console.log('🧹 Starting cleanup of orphaned data...');

    // Get all existing project IDs
    const existingProjects = await Project.find({}, '_id');
    const existingProjectIds = existingProjects.map(p => p._id.toString());

    console.log(`📊 Found ${existingProjectIds.length} existing projects`);

    // Find and delete orphaned project versions
    const orphanedVersionsResult = await ProjectVersion.deleteMany({
      projectId: { $nin: existingProjectIds }
    });

    // Find and delete orphaned file versions
    const orphanedFilesResult = await FileVersion.deleteMany({
      projectId: { $nin: existingProjectIds }
    });

    // Find and delete orphaned messages
    const orphanedMessagesResult = await Message.deleteMany({
      projectId: { $nin: existingProjectIds }
    });

    console.log(`🗑️ Deleted ${orphanedVersionsResult.deletedCount} orphaned project versions`);
    console.log(`🗑️ Deleted ${orphanedFilesResult.deletedCount} orphaned file versions`);
    console.log(`🗑️ Deleted ${orphanedMessagesResult.deletedCount} orphaned messages`);

    console.log('✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupOrphanedData();
