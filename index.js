'use strict';

const glob = require("glob"),
  fs = require('fs'),
  path = require('path'),
  format = require('./format'),
  chokidar = require('chokidar');

/**
 *  Reg Parse
 */
const LESSPARSE = /([..\/]+[\w]+)+\.less/g;
//TODO Other fileTypes
const IMGPARSE = 0;


/**
 *  Tree of Dependenies
 */
var Tree = {};

/**
 * @param {varType} path Description
 * @param {varType} option Description
 * @return {void} description
 */
function LessDiff(srcPath, options) {
  srcPath = srcPath || "src/**/*.less";
  this._getTree(srcPath, {}, function() {
    chokidar.watch(srcPath, {
      ignored: /[\/\\]\./
    }).on('change', function(path, event) {
      console.info(path);
	  //console.info(Tree);
      //console.info(Tree);
      if (Tree[path]) {
        console.info(Tree[path]);
      }
    });
  });

}

/**
 * @param {varType} src Description
 * @return {void} description
 */
LessDiff.prototype._getTree = function(srcPath, opts, callback) {
  glob(srcPath, opts, (err, files) => {
    if (err) return;
    files.forEach((file, idx) => {
      const data = fs.readFileSync(file, 'utf8'); 
      const dpPathList = this._getDpList(data, file);
      this._toTree(dpPathList, file);
    });
	console.log(Tree);
    fs.writeFileSync('tree.js', format(JSON.stringify(Tree)));
    console.log('render end');
    callback();
  });
}

/**
 * Get Dependencies Path List
 * @param {varType} buffer Description
 * @return {void} description
 */
LessDiff.prototype._getDpList = function(buffer, currentPath) {
  const list = buffer.match(LESSPARSE) || [];
  return list.map((_path, idx) => {
	//console.log('currentPath:'+currentPath);
	//console.log('_path:'+_path);
	const dirPath = path.dirname(currentPath);
	//console.log('joined:'+ path.join(dirPath, _path));
    return path.join(dirPath, _path);
  });
}


/**
 * @param {varType} srcPath Description
 * @param {varType} pathsList Description
 * @return {void} description
 */
LessDiff.prototype._toTree = function(dpPathList, currentPath) {
  //if (!Tree[currentPath]) Tree[currentPath] = [];
  dpPathList.forEach((_path, idx) => {
    if (!Tree[_path]) Tree[_path] = [];
    Tree[_path].push(currentPath);
	//console.log(Tree);
  });
  return Tree;
}


/**
 * Export LessDiff
 * @param {varType} path Description
 * @param {varType} options Description
 * @return {void} description
 */
exports.watch = function(path, options) {
  return new LessDiff(path, options);
};

