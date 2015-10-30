var Q = require("q");
var _ = require("lodash");
var color = require('bash-color');
var fs = require('fs');
var pathd = require('path');

var pkg = require("../package.json");

/**
 * Get a summary from a fold such as `en`
 * @param path Path 
 */

// Todo: migrate to a object and can get from a book.json.
// Give some variables
var rootFolder,
    outputFile,
    catalogFolders,
    ignoreFolders,
    unchangedCatalog,
    bookName,

    bookTitle;

// Get options
function init(options) {
    rootFolder = options.rootfolder || '.';
    outputFile = options.outputfile || rootFolder + '/tt.md';

    catalogFolders = options.catalogfolders || 'all';
    ignoreFolders = options.ignorefolders || ['0home'];
    unchangedCatalog = options.unchangedcatalog || ['myApp'];
    bookName = options.bookname || 'Your Book Name';

    bookTitle = "# " + bookName + "\n\n";
}

// Get filesObjects
function filterCatelogFiles(path) {
    var result = {};
    var filesObject = getAllFiles(path);

    if (catalogFolders === 'all') {
        result = filesObject[path]
    } else {
        result = _.pick(filesObject[path], filterRules);
    };

    return result;
}

function getAllFiles(path) {
    var filesObject = {};
    filesObject[path] = {};

    readFile(path, filesObject[path]);

    return filesObject;
}

// Filter in the `catalogFolders` and exclude in the `ignoreFolders`
function filterRules(n, key) {
    return _.includes(catalogFolders, key) && !_.includes(ignoreFolders, key);
}

// Use a loop to read all files
function readFile(path, filesObject) {
    //同步读取
    files = fs.readdirSync(path);
    files.forEach(walk);

    function walk(file) {
        var newpath = path + '/' + file;
        var state = fs.statSync(newpath);

        if (state.isDirectory()) {
            filesObject[file] = {};
            readFile(newpath, filesObject[file]);
        } else {
            // Parse the file.
            var obj = pathd.parse(newpath);
            // Get size of the file with `kb`.
            //obj.size = state.size;

            // Delete `en/` from the  dir.
            var dir = _.drop(obj.dir.split("/"), 1).join("/");

            //  Only get markdown files.
            if (obj.ext === '.md') {
                //filesObject[obj.name.toLowerCase()] = "* [" + formatName(obj.name) + "](" + dir + "/" + obj.base + ")\n";
                filesObject[obj.name] = dir + "/" + obj.base + ")\n";
            }
        }
    }
}

// Don`t format the files like `req.options.*` using dot.
function formatName(name) {
    var result = '';

    if (_.size(name.split(".")) > 1 || _.includes(unchangedCatalog, name)) {
        // console.log(name);
        result = name;
    } else {
        // console.log(name);
        result = _.startCase(name);
    };
    return result;
}

function formatKey(key){
    return "* [" + formatName(key) + "](";
}

// Write to file  encoded with utf-8
function writeFile(fileName, data) {
    fs.writeFile(fileName, data, 'utf-8', function() {
        console.log(color.red("Finished, you can find SUMMARY.md in your folder."));
    })
}

// Get summary 
function summary(options) {
    init(options);
    var str = '';
    var desc = '';
    var step = 0;
    var skip = null;

    var filesObj = filterCatelogFiles(rootFolder);

    work(filesObj);

    function work(filesObj) {
        _.forEach(filesObj, function(n, key) {
            if (!_.includes(ignoreFolders, key)) {
                if (_.isObject(n)) {

                    // It means folderName == subFileName, for example: */assets/assets.md,
                    // or the file is `readme.md`
                    if (_.isString(n[key]) || _.isString(n[key.toLowerCase()])) {
                        //desc += _.repeat(' ', step) + formatKey(key) || formatKey(key.toLowerCase()) + n[key];
                        desc += _.repeat(' ', step) + formatKey(key) + n[key];

                        // Mark it to skip
                        skip = key;
                    } else if (_.isString(n['readme']) || _.isString(n['Readme']) || _.isString(n['README'])) {
                        var readmeDir = n['readme'] || n['Readme'] || n['README'];
                        desc += _.repeat(' ', step) + formatKey(key) + readmeDir ;

                        // Mark it to skip
                        skip = key;
                    } else {
                        desc += _.repeat(' ', step) + "- " + formatName(key) + "\n";
                    };

                    // Start a loop
                    step += 2;
                    work(n);
                    step -= 2;
                } else {
                    // Skip
                    if (!_.isEmpty(skip) && _.isEqual(skip, key)) {
                        return false;
                    };

                    desc += _.repeat(' ', step + 2) + formatKey(key) + n;
                }
            };
        });
    }

    str += bookTitle + desc;
    return writeFile(outputFile, str);
}

module.exports = {
    summary: summary
};