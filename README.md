#LessDiff


## 1.x Version 

```
const lessDiff = require('lessdiff');

gulp.task('watch', function() {
	lessDiff.watch('src/**/*.less');
});

## 2.x Version

```
const lessDiff = require('lessdiff').LessDiff;
const chokidar = require('chokidar');
var debugPath = '';

gulp.task('watch', function() {

    var lessdiff = new lessDiff();
    //在当前路径下生成less文件依赖关系tree.js，同时在内存中保存一份
    lessdiff._getTree('src/**/*.less');


    //less 增量更新
    chokidar.watch('src/**/*.less').on('change', (path, event) => {
       //或者依赖关系，返回需要变更的文件集
       debugPath = lessdiff._getChangedList(path);
        gulp.start('css',()=>{
            debugPath = '';
        });
    });
});

```
