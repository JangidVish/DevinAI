import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all file versions and look for React-related files
    const files = await mongoose.connection.db.collection('fileversions').find({}).toArray();
    console.log('\n=== ALL FILE VERSIONS ===');
    files.forEach(f => {
      console.log(`File: ${f.fileName} | Project: ${f.projectId.toString()} | Path: ${f.filePath}`);
    });

    // Look for React/HTML/CSS files specifically
    const reactFiles = files.filter(f =>
      f.fileName.includes('.jsx') ||
      f.fileName.includes('.html') ||
      f.fileName.includes('.css') ||
      f.fileName.includes('React') ||
      f.fileName.includes('calculator') ||
      f.content?.toLowerCase().includes('react') ||
      f.content?.toLowerCase().includes('calculator')
    );

    console.log('\n=== REACT/HTML/CSS FILES ===');
    if (reactFiles.length === 0) {
      console.log('No React/HTML/CSS files found');
    } else {
      reactFiles.forEach(f => {
        console.log(`React File: ${f.fileName} | Project: ${f.projectId.toString()} | Path: ${f.filePath}`);
        console.log(`Content preview: ${f.content.substring(0, 100)}...`);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB();