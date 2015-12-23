const glob = require("glob"),
  fs = require('fs'),
  path = require('path');

const log = require('nl-clilog'),
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
function LessDiff(srcPath, distPath, options) {

  srcPath = srcPath || "src/**/*.less";
  distPath = distPath || DEFAULTDIST;
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
      const dpPathList = this.getDpList(data, file);
      this.writeDpList(dpPathList, file);
    });
    fs.writeFileSync('tree.js', format(JSON.stringify(Tree)));
    log.debug('已在当前目录生成依赖关系文件"tree.js"');
    callback && callback(Tree);
  });
}


/**
 * @param {varType} path Description
 * @return {void} description
 */
LessDiff.prototype._getChangedList = function(path) {

  //if (!pathList) pathList = [];
  this.pathList = [];
  this.changedList = [];

  this.redex(path);
  this.changedList.forEach((chaneged,idx)=>{
  	log.error('changed:' + chaneged);
  });


  return _unique(this.pathList);
}

LessDiff.prototype.redex = function(path, hL) {

  if (!hL) {
    hL = [];
    hL.push('\033[1;32m' + path + '\033[0m');
  } else {
    hL.push('\033[1;33m' + path + '\033[0m');
  }

  var dpList = [];

  this.pathList.push(path);
  this.changedList.push(hL.join('\033[31m' + '=>' + '\033[0m'));

  if (Tree[path] && Tree[path].length > 0) {
    // console.log( Tree[path]);
    Tree[path].forEach((_path, idx) => {
      //changedList.push(_path);
      //console.log('redex:'+path);
      dpList.push(this.redex(_path, hL));
    });
  }
}

/**
 * Get Dependencies Path List
 * @param {varType} buffer Description
 * @return {void} description
 */
LessDiff.prototype.getDpList = function(buffer, currentPath) {
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
LessDiff.prototype.writeDpList = function(dpPathList, currentPath) {
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
function _unique(_array) {
  var res = [],
    json = {};
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
exports.LessDiff = LessDiff;

