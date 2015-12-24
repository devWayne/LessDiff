#LessDiff


## 1.x Version 使用方式

```
const lessDiff = require('lessdiff');

gulp.task('watch', function() {
	lessDiff.watch('src/**/*.less');
});
```

## 2.x Version 使用方式

```2.0版本只分析文件的依赖关系，编译的过程还是由本身的task任务来执行```

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



//对原来的task任务进行改造
gulp.task('css', function() {

  /**
   *  在这里新增一个path变量用于判断是否是增量更新
   */
  const _path =  debugPath || ['src/**/*.less', 'src/**/*.css'];

  //原有的task任务无需改动
  var lessInstance = less({
    paths: [path.join(__dirname, 'src')],
    relativeUrls: true
  });

  lessInstance.on('error', function(e) {
    console.log("Error: ", e.message);
    lessInstance.end();
  });

  return gulp.src(_path)
    .pipe(gulpif(ifless, lessInstance))
    .pipe(gulp.dest('build'));
});

```

```控制台输出：```   

![](https://img.alicdn.com/tps/TB18DN6LXXXXXcDXFXXXXXXXXXX-859-296.png)
