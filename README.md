# Extract Source Map Code

A small NodeJS tool to extract code from a source map and re-create the structure of the original files.

This is just a small tool for my own purposes to make viewing the original code from a source map easier.

## Usage

```
node extract.js /path/to/sourceMapFile1 /path/to/sourceMapFile2 /path/to/sourceMapFile3
```

The tool can accept one or more command-line arguments, each representing the path to a source map file.