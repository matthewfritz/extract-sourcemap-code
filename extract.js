const fs = require('fs-extra');
const path = require('path');

const sourcePathArray = process.argv.slice(2); // don't process "node" or the script name
console.log("[INFO] Processing " + sourcePathArray.length + " source map file(s)...");
console.log("");

// iterate over the array of command-line parameters representing file paths
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
			console.log("[INFO] Creating metadata file...");
			fs.mkdirsSync(dirName);
			fs.writeJsonSync(metadataFilePath, metadataObj, {spaces: 3});
			console.log("[INFO] Metadata file created");
			console.log("");

			// iterate over the source code mappings and extract
			console.log("[INFO] Extracting " + sourceFilePaths.length + " source file(s) from source map " + (sourceIndex+1) + "...");
			console.log("");
			sourceFilePaths.forEach(function(path, index) {
				try {
					// write the matching indexed content from the sourceContent object
					console.log("[INFO] Extracting source file " + (index+1) + ": " + path);
					let fileContent = sourceMapObj.sourcesContent[index];
					fs.outputFileSync(dirName + "/" + path, fileContent);
					console.log("[INFO] Extracted source file");
				} catch (e) {
					console.log("[ERROR] Could not write output file: " + path);
					console.error(e);
				}
			});
			console.log("");
			console.log("[INFO] Finished extracting " + sourceFilePaths.length + " file(s) from source map " + (sourceIndex+1));
		} catch (e) {
			console.error("[ERROR] Could not write metadata file: ", e);
		}
	} catch(e) {
		console.error("[ERROR] Could not load source map " + (sourceIndex+1) + ": ", e);
	}
	console.log("");
});

console.log("[INFO] Done.");