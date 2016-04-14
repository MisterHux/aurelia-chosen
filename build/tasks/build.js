var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var paths = require('../paths');
var assign = Object.assign || require('object.assign');
var notify = require('gulp-notify');
var typescript = require('gulp-tsb');
var through2 = require('through2');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var rename = require('gulp-rename');
var tools = require('aurelia-tools');
var gutil = require('gulp-util');
var map = require('map-stream');
var gif = require('gulp-if');

var jsName = paths.packageName + '.js';
var indexName = './index.ts';

  
var log = function(file, cb) {
  console.log(file.path);
  cb(null, file);
};

gulp.task('build-index', function(){
  var importsToAdd = [];
  var files = [indexName].map(function(file) {
    return paths.root + file;
  });

  return gulp.src(files)
    .pipe(through2.obj(function(file, enc, callback) {
      file.contents = new Buffer(tools.extractImports(file.contents.toString("utf8"), importsToAdd));
      this.push(file);
      return callback();
    }))
    .pipe(concat(jsName))
    .pipe(insert.transform(function(contents) {
      return tools.createImportBlock(importsToAdd) + contents;
    }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('build-amd', function() {
  var typescriptOptions = require('../../tsconfig.json').compilerOptions;
  typescriptOptions["module"] = "amd";
  typescriptOptions["target"] = "es5";
  typescriptOptions["sourceMap"] = false;
  //typescriptOptions["declaration"] = true;

  var typescriptCompiler = typescript.create(typescriptOptions);

  return gulp.src(paths.dtsSrc.concat(paths.source))
    .pipe(plumber())
    //.pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    //.pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gif('**/index.js', rename({basename: paths.packageName})))
    .pipe(gulp.dest(paths.output + 'amd'));
});

// transpiles changed es6 files to SystemJS format
// the plumber() call prevents 'pipe breaking' caused
// by errors from other gulp plugins
// https://www.npmjs.com/package/gulp-plumber
gulp.task('build-system', function() {
  var typescriptOptions = require('../../tsconfig.json').compilerOptions;
  typescriptOptions["module"] = "system";
  typescriptOptions["target"] = "es5";
  typescriptOptions["sourceMap"] = false;

  var typescriptCompiler = typescript.create(typescriptOptions);

  return gulp.src(paths.dtsSrc.concat(paths.source))
    .pipe(plumber())
    //.pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    //.pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gif('**/index.js', rename({basename: paths.packageName})))
    .pipe(gulp.dest(paths.output + 'system'));
});

gulp.task('build-commonjs', function() {
  var typescriptOptions = require('../../tsconfig.json').compilerOptions;
  typescriptOptions["module"] = "commonjs";
  typescriptOptions["target"] = "es5";
  typescriptOptions["sourceMap"] = false;

  var typescriptCompiler = typescript.create(typescriptOptions);

  return gulp.src(paths.dtsSrc.concat(paths.source))
    .pipe(plumber())
    //.pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    //.pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gif('**/index.js', rename({basename: paths.packageName})))
    .pipe(gulp.dest(paths.output + 'commonjs'));
});

gulp.task('build-es6', function() {
  var typescriptOptions = require('../../tsconfig.json').compilerOptions;
  typescriptOptions["target"] = "es6";
  typescriptOptions["sourceMap"] = false;

  var es6Compiler = typescript.create(typescriptOptions);

  return gulp.src(paths.dtsSrcEs6.concat(paths.source))
    .pipe(plumber())
    //.pipe(sourcemaps.init({loadMaps: true}))
    .pipe(es6Compiler())
    //.pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
    .pipe(gif('**/index.js', rename({basename: paths.packageName})))
    .pipe(gulp.dest(paths.output + 'es6'));
});

// copies changed html files to the output directory
gulp.task('build-html', function() {
  return gulp.src(paths.html)
    .pipe(changed(paths.output, {extension: '.html'}))
    .pipe(gulp.dest(paths.output + 'es6'))
    .pipe(gulp.dest(paths.output + 'commonjs'))
    .pipe(gulp.dest(paths.output + 'amd'))
    .pipe(gulp.dest(paths.output + 'system'));
});

// copies changed css files to the output directory
gulp.task('build-css', function() {
  return gulp.src(paths.css)
    .pipe(changed(paths.output, {extension: '.css'}))
    .pipe(gulp.dest(paths.output));
});

gulp.task('copy-dts', function() {
  return gulp.src(paths.tsd)
      .pipe(gulp.dest(paths.output + 'es6'))
      .pipe(gulp.dest(paths.output + 'commonjs'))
      .pipe(gulp.dest(paths.output + 'amd'))
      .pipe(gulp.dest(paths.output + 'system'));
});


// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    'build-index',
    ['build-es6', 'build-commonjs', 'build-amd', 'build-system', 'build-html', 'build-css', 'copy-dts'],
    callback
  );
});
