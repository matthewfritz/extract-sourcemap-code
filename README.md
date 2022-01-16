# Extract Source Map Code

A small NodeJS tool to extract code from a source map and re-create the structure of the original files.

This is just a small tool for my own purposes to make viewing the original code from a source map easier.

## Usage

```
node extract.js sourceFilePath1.map sourceFilePath2.map sourceFilePath3.map
```

The tool can accept one or more command-line arguments, each representing the path to a source map file.