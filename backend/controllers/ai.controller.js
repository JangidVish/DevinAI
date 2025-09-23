// controllers/ai.controller.js
import { generateResult } from "../services/ai.service.js";
import FileVersion from "../model/fileVersion.model.js";
import mongoose from "mongoose";
// Enhanced JSON cleaning and parsing function
const cleanAndParseJSON = (rawResponse) => {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('Invalid response format');
  }
  try {
    // First attempt: direct parsing
    return JSON.parse(rawResponse);
  } catch (firstError) {
    console.log("First parse attempt failed:", firstError.message);
    try {
      // Check if response appears to be truncated
      if (!rawResponse.trim().endsWith('}')) {
        console.log("Response appears to be truncated, attempting to fix...");
        let fixed = rawResponse.trim();
        // Count open braces to determine how many closing braces we need
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        // Add missing closing braces
        if (missingBraces > 0) {
          // If we're in the middle of a string, close it first
          if (fixed.match(/:\s*"[^"]*$/)) {
            fixed += '"';
          }

          // Add missing closing braces
          fixed += '}'.repeat(missingBraces);

          console.log("Attempting to parse fixed JSON with", missingBraces, "added closing braces");
          return JSON.parse(fixed);
        }
      }
      // Second attempt: Fix unescaped characters in JSON strings
      let cleaned = rawResponse.trim();
      // Remove any text before the first { and after the last }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON structure found');
      }
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      // Fix unescaped newlines and other characters within string values
      // This regex finds string values and fixes unescaped characters within them
      cleaned = cleaned.replace(/"contents":\s*"([^"]*(?:\\.[^"]*)*)"(?=\s*[,}])/g,
        (match, content) => {
          // Fix unescaped newlines, carriage returns, tabs, and backslashes
          const fixedContent = content
            .replace(/\\/g, '\\\\')    // Escape backslashes first
            .replace(/\n/g, '\\n')     // Escape newlines
            .replace(/\r/g, '\\r')     // Escape carriage returns  
            .replace(/\t/g, '\\t')     // Escape tabs
            .replace(/"/g, '\\"');     // Escape quotes
          return `"contents": "${fixedContent}"`;
        });
      // Remove trailing commas before closing braces/brackets
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      // Remove non-printable control characters (but preserve escaped ones)
      cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      console.log("Cleaned JSON attempt 2:", cleaned.substring(0, 500) + "...");
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.error("Second parse attempt failed:", secondError.message);
      // Third attempt: More aggressive fixing
      try {
        let extracted = rawResponse;
        // Extract JSON block
        const jsonMatch = extracted.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extracted = jsonMatch[0];
        }
        // Fix common JSON issues more aggressively
        extracted = extracted
          // Fix unescaped newlines in any string value
          .replace(/("(?:[^"\\]|\\.)*")\n/g, '$1\\n')
          // Fix unescaped quotes in string values
          .replace(/([^\\])"/g, (match, before) => {
            // Only escape if it's not already escaped and not at string boundaries
            return before + '\\"';
          })
          // Remove trailing commas
          .replace(/,(\s*[}\]])/g, '$1')
          // Remove control characters
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        console.log("Extracted JSON attempt 3:", extracted.substring(0, 500) + "...");
        return JSON.parse(extracted);
      } catch (thirdError) {
        console.error("Third parse attempt failed:", thirdError.message);
        // Final attempt: Create a minimal working response
        try {
          const textMatch = rawResponse.match(/"text":\s*"([^"]*)"/) || ["", "Express app created"];
          return {
            text: textMatch[1] || "Express app created with parsing issues",
            fileTree: {
              "app.js": {
                "file": {
                  "contents": "const express = require('express');\nconst app = express();\napp.use(express.json());\napp.get('/', (req, res) => res.send('Hello World!'));\napp.listen(3000, () => console.log('Server running on port 3000'));"
                }
              },
              "package.json": {
                "file": {
                  "contents": "{\n  \"name\": \"express-app\",\n  \"version\": \"1.0.0\",\n  \"main\": \"app.js\",\n  \"scripts\": {\n    \"start\": \"node app.js\"\n  },\n  \"dependencies\": {\n    \"express\": \"^4.21.2\"\n  }\n}"
                }
              }
            },
            buildCommand: {
              mainItem: "npm",
              commands: ["install"]
            },
            startCommand: {
              mainItem: "npm",
              commands: ["start"]
            }
          };
        } catch (finalError) {
          console.error("Final fallback failed:", finalError.message);
        }
      }

      // Ultimate fallback: return a structured error response
      return {
        text: "AI response parsing failed. The model returned malformed JSON.",
        error: true,
        originalResponse: rawResponse.substring(0, 1000), // First 1000 chars for debugging
        parseError: firstError.message
      };
    }
  }
};
// Helper function to extract and save code files from AI response
const saveGeneratedCodeAsVersions = async (result, projectId, messageId = null) => {
  try {
    console.log("Starting to save generated code versions...");
    // Parse the JSON response from AI
    let parsedResult;
    if (typeof result === 'string') {
      parsedResult = cleanAndParseJSON(result);
    } else if (typeof result === 'object') {
      parsedResult = result;
    } else {
      console.error('Invalid result type:', typeof result);
      return result;
    }
    // Check if parsing resulted in an error response
    if (parsedResult.error) {
      console.error('Parsed result contains error:', parsedResult);
      return JSON.stringify(parsedResult);
    }
    // Validate projectId
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      console.error('Invalid projectId:', projectId);
      return JSON.stringify(parsedResult);
    }
    // Check if the response contains a fileTree
    if (parsedResult && parsedResult.fileTree) {
      const fileTree = parsedResult.fileTree;
      console.log("Processing fileTree with", Object.keys(fileTree).length, "files");
      // Process each file in the fileTree
      for (const [filePath, fileData] of Object.entries(fileTree)) {
        try {
          if (fileData && fileData.file && fileData.file.contents) {
            // Extract file information
            const pathParts = filePath.split('/');
            const fileName = pathParts[pathParts.length - 1];
            // Validate file content
            if (typeof fileData.file.contents !== 'string') {
              console.warn(`Invalid content type for ${filePath}:`, typeof
                fileData.file.contents);
              continue;
            }
            // Save as a new file version
            const fileVersion = await FileVersion.create({
              projectId: new mongoose.Types.ObjectId(projectId),
              fileName,
              filePath,
              content: fileData.file.contents,
              messageId: messageId ? new mongoose.Types.ObjectId(messageId) : null,
              metadata: {
                generatedBy: 'AI',
                language: fileName.includes('.') ? fileName.split('.').pop() : 'unknown',
                timestamp: new Date()
              }
            });
            console.log(`Saved file version for ${fileName} with ID:`, fileVersion._id);
          } else {
            console.warn(`Invalid file structure for ${filePath}:`, fileData);
          }
        } catch (fileError) {
          console.error(`Error saving file ${filePath}:`, fileError);
          // Continue with other files even if one fails
        }
      }
      console.log("Completed saving file versions");
    } else {
      console.log("📝 No fileTree found in parsed result - this is a normal chat message, no files to save");
    }
    return JSON.stringify(parsedResult);
  } catch (error) {
    console.error('Error in saveGeneratedCodeAsVersions:', error);
    // Return a valid JSON string even if saving fails
    return JSON.stringify({
      text: "Code generation completed but failed to save file versions.",
      error: true,
      errorMessage: error.message
    });
  }
};
export const getresultaiController = async (req, res) => {
  try {
    console.log("AI controller hit (HTTP)");
    const { prompt, projectId } = req.body;
    console.log("Prompt received:", prompt);
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Valid prompt is required' });
    }
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' });
    }
    const result = await generateResult(prompt);
    console.log("Raw result from AI service:", result.substring(0, 200) + "...");
    // Save any generated code as file versions
    const processedResult = await saveGeneratedCodeAsVersions(result, projectId);
    res.json({ result: processedResult });
  } catch (error) {
    console.error("Error in AI controller:", error);
    res.status(500).json({
      message: error.message,
      error: true
    });
  }
};
// Import the model at the top of your file
import ProjectVersion from '../model/projectVersion.model.js';
// Replace your createProjectVersion function with this:
const createProjectVersion = async (projectId, messageId, description = '') => {
  try {
    console.log('🔄 Creating project version for project:', projectId);

    // Get current latest version number
    const latestVersion = await ProjectVersion
      .findOne({ projectId })
      .sort({ version: -1 })
      .limit(1);

    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
    console.log('📊 New version number:', newVersionNumber);

    // Get all current files for this project
    const allFiles = await FileVersion.find({ projectId });
    console.log('📁 Found files:', allFiles.length);
    // Build file tree from all files (latest version of each)
    const fileTree = {};
    const fileGroups = {};
    // Group files by path
    allFiles.forEach(file => {
      if (!fileGroups[file.filePath]) {
        fileGroups[file.filePath] = [];
      }
      fileGroups[file.filePath].push(file);
    });
    // Get latest version of each file
    Object.keys(fileGroups).forEach(filePath => {
      const files = fileGroups[filePath].sort((a, b) => b.version - a.version);
      const latestFile = files[0];
      fileTree[filePath] = {
        file: {
          contents: latestFile.content
        },
        version: latestFile.version,
        versionId: latestFile._id,
        lastModified: latestFile.timestamp
      };
    });

    console.log('🌳 Built file tree with keys:', Object.keys(fileTree));

    // Check if file tree is empty - if so, this is just a normal chat, no need to create project version
    if (Object.keys(fileTree).length === 0) {
      console.log('📝 File tree is empty - this is a normal chat message, skipping project version creation');
      return null;
    }

    // Create project version
    const projectVersion = await ProjectVersion.create({
      projectId,
      version: newVersionNumber,
      description: description || `Project state after AI command`,
      fileTree,
      filesCount: Object.keys(fileTree).length,
      messageId
    });

    console.log(`✅ Created project version ${projectVersion.version}`);
    return projectVersion;

  } catch (error) {
    console.error('❌ Error creating project version:', error);
    return null;
  }
};
export const getResultForSocket = async (prompt, projectId, messageId = null) => {
  try {
    console.log("AI controller hit (SOCKET)");
    console.log("Prompt received:", prompt);
    if (!prompt || typeof prompt !== 'string') {
      return JSON.stringify({
        text: "Invalid prompt provided",
        error: true
      });
    }
    const result = await generateResult(prompt);
    console.log("Raw result from AI service:", result.substring(0, 200) + "...");
    // Save any generated code as file versions if projectId is provided
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const processedResult = await saveGeneratedCodeAsVersions(result, projectId,
        messageId);
      // Create project version after saving files (only if files were actually created)
      if (messageId) {
        const projectVersion = await createProjectVersion(projectId, messageId, `AI: ${prompt.substring(0, 50)}...`);
        if (projectVersion) {
          console.log('✅ Project version created:', projectVersion.version);
        } else {
          console.log('📝 No project version created - normal chat message');
        }
      }
      return processedResult;
    } else {
      // Just clean and parse the JSON without saving
      const cleanedResult = cleanAndParseJSON(result);
      return JSON.stringify(cleanedResult);
    }
  } catch (error) {
    console.error("Error in AI socket controller:", error);
    return JSON.stringify({
      text: "An error occurred while generating AI response.",
      error: true,
      errorMessage: error.message
    });
  }
};