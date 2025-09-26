import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all projects
    const projects = await mongoose.connection.db.collection('projects').find({}).toArray();
    console.log('\n=== PROJECTS ===');
    projects.forEach(p => console.log('Project:', p._id.toString(), '-', p.name));

    // Get all project versions  
    const versions = await mongoose.connection.db.collection('projectversions').find({}).toArray();
    console.log('\n=== PROJECT VERSIONS ===');
    versions.forEach(v => console.log('Version:', v._id.toString(), 'Project:', v.projectId.toString(), 'Files:', Object.keys(v.fileTree || {})));

    // Get all file versions
    const files = await mongoose.connection.db.collection('fileversions').find({}).toArray();
    console.log('\n=== FILE VERSIONS ===');
    files.forEach(f => console.log('File:', f.fileName, 'Project:', f.projectId.toString(), 'Path:', f.filePath));

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB();