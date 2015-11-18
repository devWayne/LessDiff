const glob = require("glob"),
  fs = require('fs'),
  path = require('path');

const chokidar = require('chokidar'),
  log = require('nl-clilog'),
  less = require('less'),
  mkdirp = require('mkdirp');

const format = require('./format');

/**
 *  Reg Parse
 */
const LESSPARSE = /([..\/]+[\w-]+)+\.less/g;
//TODO Other fileTypes
const IMGPARSE = 0;

//TODO
//目前不可变
const DEFAULTDIST = 'build/';

/**
 *  Tree of Dependenies
 */
var Tree = {};

/**
 * @param {varType} path Description
 * @param {varType} option Description
 * @return {void} description
 */
function LessDiff(srcPath,distPath,options) {
	
  srcPath = srcPath || "src/**/*.less";
  distPath = distPath || DEFAULTDIST;


  this._getTree(srcPath, {}, () => {
    chokidar.watch(srcPath, {
      ignored: /[\/\\]\./
    }).on('change', (path, event) => {
      console.info('changed:'+path);
      //if (Tree[path] && Tree[path].length > 0) {
	  	this._render(path,DEFAULTDIST);
        this._redex([], path, Tree[path]);
      //}
    });
  });
}

/**
 * @param {varType} path Description
 * @param {varType} tree Description
 * @return {void} description
 */
LessDiff.prototype._redex = function(pathList, path, node) {
  var pathList = pathList || [];
  pathList.push(path);
  //log.debug(node);
  if (!node) return;
  this._log(pathList, node);
  if (node.length == 0) return;
  node.forEach((value, idx) => {
    if (Tree[value] && Tree[value].length > 0) {
      this._redex(this._unique(pathList), value, Tree[value]);
    }
  });
}

/**
 * Console Log
 * @param {varType} path Description
 * @param {varType} tree Description
 * @return {void} description
 */
LessDiff.prototype._log = function(pathList, node) {
  const ARROW = '\033[31m => \033[0m';
  return node.forEach((v, idx) => {
    console.info('\033[1;33m' + pathList.join(ARROW) + '\033[0m' + ARROW + '\033[1;32m' + v.toString() + '\033[0m');
    this._render(v,DEFAULTDIST);
  });
}


/**
 * @param {varType} content Description
 * @return {void} description
 */
LessDiff.prototype._render = function(_path,distPath) {
  const content = fs.readFileSync(_path).toString();
  var opts = {};
  opts.filename = _path;

  return less.render(content, opts).then(function(res) {
    const distPath = _path.replace('src/', DEFAULTDIST).replace('less', 'css');
    mkdirp(path.dirname(distPath), function(err) {
      if (err) console.error(err);
      else {
        log.error('build:' + distPath);
        fs.writeFileSync(distPath, res.css);
        return;
      }
    });

  }).catch(function(err) {
    // Convert the keys so PluginError can read them
    err.lineNumber = err.line;
    err.fileName = err.filename;

    // Add a better error message
    err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;
    log.error(err.message);
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
    fs.writeFileSync('tree.js', format(JSON.stringify(Tree)));
    log.debug('已在当前目录生成依赖关系文件"tree.js"');
    callback(Tree);
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
    const dirPath = path.dirname(currentPath);
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
  });
  return Tree;
}

/**
 * @param {varType} _array Description
 * @return {void} description
 */
LessDiff.prototype._unique = function(_array) {
  var res = [], json = {};
  for (var i = 0; i < _array.length; i++) {
    if (!json[_array[i]]) {
      res.push(_array[i]);
      json[_array[i]] = 1;
    }
  }
  return res;
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

