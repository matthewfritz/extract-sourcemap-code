const fs = require('fs-extra');
const path = require('path');

console.log("==============================");
console.log("EXTRACT JS/CSS SOURCE MAP CODE");
console.log("By Matthew Fritz");
console.log("==============================");
console.log("");

const sourcePathArray = process.argv.slice(2); // don't process "node" or the script name
console.log("[INFO] Processing " + sourcePathArray.length + " source map file(s)...");
console.log("");

// iterate over the array of command-line parameters representing file paths
let sourceMapSuccessCount = 0;
let sourceMapFailureCount = 0;
let runningSuccessTotal = 0;
let runningFailureTotal = 0;
sourcePathArray.forEach(function(sourceMapPath, sourceIndex) {
	let dirName = "extracted_" + path.basename(sourceMapPath);
	let metadataFileName = "metadata_" + path.basename(sourceMapPath);
	let metadataFilePath = dirName + "/" + metadataFileName;

	console.log("[INFO] Loading source map " + (sourceIndex+1) + ": " + sourceMapPath);
	console.log("");
	console.log("[INFO] Output directory " + (sourceIndex+1) + ": " + dirName);
	console.log("[INFO] Metadata output file " + (sourceIndex+1) + ": " + metadataFilePath);
	console.log("");

	try {
		// load the source map file as a JSON object
		let sourceMapObj = fs.readJsonSync(sourceMapPath);
		console.log("[INFO] Source map " + (sourceIndex+1) + " loaded. Parsing...");
		console.log("");

		// iterate over the sources, re-work file paths, and remove tokens
		let sourceFilePaths = sourceMapObj.sources;
		sourceFilePaths = sourceFilePaths.map(function(path) {
			while(path.indexOf('../') != -1) {
				path = path.replace('../', '');
			}
			return path;
		}).filter(function(path) {
			// we only want true source file paths
			return path.indexOf('external ') == -1;
		});

		try {
			let metadataObj = {
				version: sourceMapObj.version,
				names: sourceMapObj.names,
				sources: sourceFilePaths,
			};

			// make the directory and then write the extracted metadata
			console.log("[INFO] Creating metadata file " + (sourceIndex+1) + "...");
			fs.ensureDirSync(dirName);
			fs.writeJsonSync(metadataFilePath, metadataObj, {spaces: 3});
			console.log("[INFO] Metadata file created");
			console.log("");

			// iterate over the source code mappings and extract
			console.log("[INFO] Extracting " + sourceFilePaths.length + " source file(s) from source map " + (sourceIndex+1) + "...");
			console.log("");
			let extractSuccessCount = 0;
			let extractFailureCount = 0;
			sourceFilePaths.forEach(function(path, index) {
				try {
					// write the matching indexed content from the sourceContent object
					console.log("[INFO] (" + (index+1) + "/" + sourceFilePaths.length + ") Extracting source file: " + path);
					let fileContent = sourceMapObj.sourcesContent[index];
					fs.outputFileSync(dirName + "/" + path, fileContent);
					console.log("[INFO] (" + (index+1) + "/" + sourceFilePaths.length + ") Extracted source file");
					extractSuccessCount++;
				} catch (e) {
					console.log("[ERROR] (" + (index+1) + "/" + sourceFilePaths.length + ") Could not write output file: " + path);
					console.error(e);
					extractFailureCount++;
				}
			});

			runningSuccessTotal += extractSuccessCount;
			runningFailureTotal += extractFailureCount;

			console.log("");
			console.log("[INFO] " + extractSuccessCount + " file(s) extracted successfully; " + extractFailureCount + " file(s) failed");
			console.log("[INFO] Finished processing " + sourceFilePaths.length + " file(s) from source map " + (sourceIndex+1));
		} catch (e) {
			console.error("[ERROR] Could not write metadata file " + (sourceIndex+1) + ": ", e);
		}
	} catch(e) {
		console.error("[ERROR] Could not load source map " + (sourceIndex+1) + ": ", e);
		sourceMapFailureCount++;
	}
	sourceMapSuccessCount++;
	console.log("");
});

console.log("----------")
console.log("STATISTICS");
console.log("----------");
console.log("Total source map files processed: " + sourcePathArray.length);
console.log("Total source map files extracted: " + sourceMapSuccessCount);
console.log("Total source map files failed: " + sourceMapFailureCount);
console.log("Total source files extracted: " + runningSuccessTotal);
console.log("Total source files failed: " + runningFailureTotal);

console.log("");
console.log("Done.");