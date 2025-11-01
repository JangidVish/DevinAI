// controllers/ai.controller.js
import { generateResult } from "../services/ai.service.js";
import FileVersion from "../model/fileVersion.model.js";
import Message from "../model/message.model.js";
import mongoose from "mongoose";
// Enhanced JSON cleaning and parsing function
const cleanAndParseJSON = (rawResponse) => {
  if (!rawResponse || typeof rawResponse !== "string") {
    throw new Error("Invalid response format");
  }
  try {
    // First attempt: direct parsing
    return JSON.parse(rawResponse);
  } catch (firstError) {
    console.log("First parse attempt failed:", firstError.message);
    try {
      // Check if response appears to be truncated
      if (!rawResponse.trim().endsWith("}")) {
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
          fixed += "}".repeat(missingBraces);

          console.log(
            "Attempting to parse fixed JSON with",
            missingBraces,
            "added closing braces"
          );
          return JSON.parse(fixed);
        }
      }
      // Second attempt: Fix unescaped characters in JSON strings
      let cleaned = rawResponse.trim();
      // Remove any text before the first { and after the last }
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No valid JSON structure found");
      }
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      // Fix unescaped newlines and other characters within string values
      // This regex finds string values and fixes unescaped characters within them
      cleaned = cleaned.replace(
        /"contents":\s*"([^"]*(?:\\.[^"]*)*)"(?=\s*[,}])/g,
        (match, content) => {
          // Fix unescaped newlines, carriage returns, tabs, and backslashes
          const fixedContent = content
            .replace(/\\/g, "\\\\") // Escape backslashes first
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t") // Escape tabs
            .replace(/"/g, '\\"'); // Escape quotes
          return `"contents": "${fixedContent}"`;
        }
      );
      // Remove trailing commas before closing braces/brackets
      cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
      // Remove non-printable control characters (but preserve escaped ones)
      cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
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
          .replace(/("(?:[^"\\]|\\.)*")\n/g, "$1\\n")
          // Fix unescaped quotes in string values
          .replace(/([^\\])"/g, (match, before) => {
            // Only escape if it's not already escaped and not at string boundaries
            return before + '\\"';
          })
          // Remove trailing commas
          .replace(/,(\s*[}\]])/g, "$1")
          // Remove control characters
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
        console.log(
          "Extracted JSON attempt 3:",
          extracted.substring(0, 500) + "..."
        );
        return JSON.parse(extracted);
      } catch (thirdError) {
        console.error("Third parse attempt failed:", thirdError.message);
        // Don't provide misleading fallback content - return error instead
        console.error(
          "All JSON parsing attempts failed. Response may be truncated or malformed."
        );
        return {
          text: "Sorry, I encountered an issue processing your request. The AI response was malformed or truncated. Please try again with a simpler request.",
          error: true,
          originalResponse: rawResponse.substring(0, 1000),
          parseError: thirdError.message,
        };
      }

      // Ultimate fallback: return a structured error response
      return {
        text: "AI response parsing failed. The model returned malformed JSON.",
        error: true,
        originalResponse: rawResponse.substring(0, 1000), // First 1000 chars for debugging
        parseError: firstError.message,
      };
    }
  }
};
// Helper function to extract and save code files from AI response
const saveGeneratedCodeAsVersions = async (
  result,
  projectId,
  messageId = null
) => {
  try {
    console.log("Starting to save generated code versions...");
    // Parse the JSON response from AI
    let parsedResult;
    if (typeof result === "string") {
      parsedResult = cleanAndParseJSON(result);
    } else if (typeof result === "object") {
      parsedResult = result;
    } else {
      console.error("Invalid result type:", typeof result);
      return result;
    }
    // Check if parsing resulted in an error response
    if (parsedResult.error) {
      console.error("Parsed result contains error:", parsedResult);
      return {
        processedResult: JSON.stringify(parsedResult),
        filesCreated: 0,
      };
    }
    // Validate projectId
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      console.error("Invalid projectId:", projectId);
      return {
        processedResult: JSON.stringify(parsedResult),
        filesCreated: 0,
      };
    }

    let filesCreated = 0;

    // Check if the response contains a fileTree
    if (parsedResult && parsedResult.fileTree) {
      const fileTree = parsedResult.fileTree;
      console.log(
        "Processing fileTree with",
        Object.keys(fileTree).length,
        "files"
      );

      // Process each file in the fileTree - handle both creation and deletion
      const fileSavePromises = Object.entries(fileTree).map(
        async ([filePath, fileData]) => {
          try {
            if (fileData && fileData.file) {
              // Extract file information
              const pathParts = filePath.split("/");
              const fileName = pathParts[pathParts.length - 1];

              // Handle file deletion
              if (fileData.file.deleted === true) {
                console.log(`🗑️ Processing deletion for ${filePath}`);

                // Create a deletion record (mark file as deleted)
                const deletionRecord = await FileVersion.create({
                  projectId: new mongoose.Types.ObjectId(projectId),
                  fileName,
                  filePath,
                  content: "", // Empty content for deleted files
                  isDeleted: true, // Mark as deleted
                  messageId: messageId
                    ? new mongoose.Types.ObjectId(messageId)
                    : null,
                  metadata: {
                    generatedBy: "AI",
                    operation: "delete",
                    timestamp: new Date(),
                  },
                });

                console.log(
                  `✅ Created deletion record for ${fileName} with ID:`,
                  deletionRecord._id
                );
                return deletionRecord;
              }
              // Handle file creation/modification
              else if (fileData.file.contents) {
                // Validate file content
                if (typeof fileData.file.contents !== "string") {
                  console.warn(
                    `Invalid content type for ${filePath}:`,
                    typeof fileData.file.contents
                  );
                  return null;
                }

                // Save as a new file version
                const fileVersion = await FileVersion.create({
                  projectId: new mongoose.Types.ObjectId(projectId),
                  fileName,
                  filePath,
                  content: fileData.file.contents,
                  isDeleted: false, // Explicitly mark as not deleted
                  messageId: messageId
                    ? new mongoose.Types.ObjectId(messageId)
                    : null,
                  metadata: {
                    generatedBy: "AI",
                    operation: "create/modify",
                    language: fileName.includes(".")
                      ? fileName.split(".").pop()
                      : "unknown",
                    timestamp: new Date(),
                  },
                });

                console.log(
                  `✅ Saved file version for ${fileName} with ID:`,
                  fileVersion._id
                );
                return fileVersion;
              } else {
                console.warn(
                  `Invalid file structure for ${filePath}:`,
                  fileData
                );
                return null;
              }
            } else {
              console.warn(`Invalid file data for ${filePath}:`, fileData);
              return null;
            }
          } catch (fileError) {
            console.error(`Error processing file ${filePath}:`, fileError);
            return null;
          }
        }
      );

      // Wait for all files to be saved
      const savedFiles = await Promise.all(fileSavePromises);
      filesCreated = savedFiles.filter((file) => file !== null).length;

      console.log(`Completed saving ${filesCreated} file versions`);
    } else {
      console.log(
        "📝 No fileTree found in parsed result - this is a normal chat message, no files to save"
      );
    }

    // Return both the parsed result and the count of files created
    return {
      processedResult: JSON.stringify(parsedResult),
      filesCreated,
    };
  } catch (error) {
    console.error("Error in saveGeneratedCodeAsVersions:", error);
    // Return a valid JSON string even if saving fails
    return {
      processedResult: JSON.stringify({
        text: "Code generation completed but failed to save file versions.",
        error: true,
        errorMessage: error.message,
      }),
      filesCreated: 0,
    };
  }
};
export const getresultaiController = async (req, res) => {
  try {
    console.log("AI controller hit (HTTP)");
    const { prompt, projectId } = req.body;
    console.log("Prompt received:", prompt);
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "Valid prompt is required" });
    }
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Valid projectId is required" });
    }
    const sessionId = req.user.id; // Placeholder for session management if needed
    const result = await generateResult(prompt, sessionId);
    console.log(
      "Raw result from AI service:",
      result.substring(0, 200) + "..."
    );
    // Save any generated code as file versions
    const saveResult = await saveGeneratedCodeAsVersions(result, projectId);
    res.json({ result: saveResult.processedResult });
  } catch (error) {
    console.error("Error in AI controller:", error);
    res.status(500).json({
      message: error.message,
      error: true,
    });
  }
};
// Import the model at the top of your file
import ProjectVersion from "../model/projectVersion.model.js";
// Replace your createProjectVersion function with this:
const createProjectVersion = async (projectId, messageId, description = "") => {
  try {
    console.log("🔄 Creating project version for project:", projectId);

    // Ensure projectId is properly converted to ObjectId
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Get current latest version number
    const latestVersion = await ProjectVersion.findOne({
      projectId: projectObjectId,
    })
      .sort({ version: -1 })
      .limit(1);

    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
    console.log("📊 New version number:", newVersionNumber);

    // Get all files for this project created by this message and all previous files
    // First, get files created by this specific message
    const filesFromThisMessage = await FileVersion.find({
      projectId: projectObjectId,
      messageId,
    });

    console.log(
      "📄 Files created by this message:",
      filesFromThisMessage.length
    );

    // Get all files for this project up to now (excluding files from this message to avoid duplicates)
    const existingFiles = await FileVersion.find({
      projectId: projectObjectId,
      messageId: { $ne: messageId },
    }).sort({ timestamp: 1 });

    console.log("� Existing files before this message:", existingFiles.length);

    // Combine all files
    const allFiles = [...existingFiles, ...filesFromThisMessage];
    console.log("📁 Total files to process:", allFiles.length);

    // Build file tree from all files
    const allFilePaths = await FileVersion.distinct("filePath", {
      projectId: projectObjectId,
    });
    const currentMessage = await Message.findById(messageId);
    const messageTimestamp = currentMessage
      ? currentMessage.timestamp
      : new Date();

    const fileTree = {};

    // For each file path, determine what version to include
    for (const filePath of allFilePaths) {
      const fileFromCurrentMessage = filesFromThisMessage.find(
        (f) => f.filePath === filePath
      );

      if (fileFromCurrentMessage) {
        // Skip files that are marked as deleted in current message
        if (fileFromCurrentMessage.isDeleted) {
          console.log(
            `🗑️ Excluding deleted file from project version: ${filePath}`
          );
          continue;
        }

        // Use version from current message
        fileTree[filePath] = {
          file: { contents: fileFromCurrentMessage.content },
          version: fileFromCurrentMessage.version,
          versionId: fileFromCurrentMessage._id,
          lastModified: fileFromCurrentMessage.timestamp,
          fromMessage: fileFromCurrentMessage.messageId,
        };
      } else {
        // Find latest version before this message
        const latestVersionBeforeMessage = await FileVersion.findOne({
          projectId: projectObjectId,
          filePath,
          timestamp: { $lt: messageTimestamp },
        }).sort({ timestamp: -1 });

        if (latestVersionBeforeMessage) {
          // Skip files that are marked as deleted in their latest version
          if (latestVersionBeforeMessage.isDeleted) {
            console.log(
              `🗑️ Excluding file marked as deleted in previous version: ${filePath}`
            );
            continue;
          }

          fileTree[filePath] = {
            file: { contents: latestVersionBeforeMessage.content },
            version: latestVersionBeforeMessage.version,
            versionId: latestVersionBeforeMessage._id,
            lastModified: latestVersionBeforeMessage.timestamp,
            fromMessage: latestVersionBeforeMessage.messageId,
          };
        }
      }
    }

    console.log("🌳 Built file tree with keys:", Object.keys(fileTree));

    // Check if file tree is empty - if so, this is just a normal chat, no need to create project version
    if (Object.keys(fileTree).length === 0) {
      console.log(
        "📝 File tree is empty - this is a normal chat message, skipping project version creation"
      );
      return null;
    }

    // Check if the fileTree has actually changed compared to the previous version
    if (latestVersion) {
      const previousFileTree = latestVersion.fileTree || {};
      const currentFileTreeKeys = Object.keys(fileTree).sort();
      const previousFileTreeKeys = Object.keys(previousFileTree).sort();

      // Check if file lists are different (files added/removed)
      const fileListChanged =
        JSON.stringify(currentFileTreeKeys) !==
        JSON.stringify(previousFileTreeKeys);

      // Check if any file contents have changed
      let fileContentsChanged = false;
      for (const filePath of currentFileTreeKeys) {
        const currentFile = fileTree[filePath];
        const previousFile = previousFileTree[filePath];

        if (
          !previousFile ||
          currentFile.file.contents !== previousFile.file.contents
        ) {
          fileContentsChanged = true;
          break;
        }
      }

      if (!fileListChanged && !fileContentsChanged) {
        console.log(
          "📝 No changes detected in fileTree - skipping project version creation"
        );
        return null;
      }

      console.log(
        `🔄 FileTree changes detected - Files added/removed: ${fileListChanged}, Contents changed: ${fileContentsChanged}`
      );
    }

    // Create project version
    const projectVersion = await ProjectVersion.create({
      projectId: projectObjectId,
      version: newVersionNumber,
      description: description || `Project state after AI command`,
      fileTree,
      filesCount: Object.keys(fileTree).length,
      messageId,
    });

    console.log(
      `✅ Created project version ${projectVersion.version} with ${
        Object.keys(fileTree).length
      } files`
    );
    return projectVersion;
  } catch (error) {
    console.error("❌ Error creating project version:", error);
    return null;
  }
};
export const getResultForSocket = async (
  prompt,
  projectId,
  messageId = null
) => {
  try {
    console.log("AI controller hit (SOCKET)");
    console.log("Prompt received:", prompt);
    console.log("Project ID:", projectId);
    console.log("Message ID:", messageId);

    if (!prompt || typeof prompt !== "string") {
      return JSON.stringify({
        text: "Invalid prompt provided",
        error: true,
      });
    }
    const result = await generateResult(prompt, projectId);
    console.log(
      "Raw result from AI service:",
      result.substring(0, 200) + "..."
    );
    // Save any generated code as file versions if projectId is provided
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      console.log("📁 Valid project ID, saving file versions...");
      const saveResult = await saveGeneratedCodeAsVersions(
        result,
        projectId,
        messageId
      );

      // Only create project version if:
      // 1. We have a messageId (valid AI interaction)
      // 2. Files were actually created/modified/deleted (saveResult.filesCreated > 0)
      // 3. The AI response doesn't contain errors
      const parsedResult = JSON.parse(saveResult.processedResult);
      const hasErrors = parsedResult.error === true;

      if (messageId && saveResult.filesCreated > 0 && !hasErrors) {
        console.log(
          `🔄 Creating project version for message: ${messageId} (${saveResult.filesCreated} files processed)`
        );

        // Add a small delay to ensure all file saves are fully committed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Always attempt to create project version - let createProjectVersion decide if fileTree changed
        const projectVersion = await createProjectVersion(
          projectId,
          messageId,
          `AI: ${prompt.substring(0, 50)}...`
        );
        if (projectVersion) {
          console.log("✅ Project version created:", projectVersion.version);
        } else {
          console.log(
            "📝 No fileTree changes detected - no project version created"
          );
        }
      } else if (messageId && saveResult.filesCreated === 0) {
        console.log(
          "📝 No files processed - normal chat message, no project version needed"
        );
      } else if (messageId && hasErrors) {
        console.log(
          "❌ AI response contains errors - no project version created"
        );
      } else {
        console.log(
          "⚠️ No messageId provided, skipping project version creation"
        );
      }
      return saveResult.processedResult;
    } else {
      console.log("⚠️ Invalid or missing project ID, just parsing result");
      // Just clean and parse the JSON without saving
      const cleanedResult = cleanAndParseJSON(result);
      return JSON.stringify(cleanedResult);
    }
  } catch (error) {
    console.error("Error in AI socket controller:", error);
    return JSON.stringify({
      text: "An error occurred while generating AI response.",
      error: true,
      errorMessage: error.message,
    });
  }
};
