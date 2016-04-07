var path = require('path');
var fs = require('fs');

var appRoot = 'src/';
var outputRoot = 'dist/';
var exporSrvtRoot = 'export/'

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));


module.exports = {
  root: appRoot,
  source: appRoot + '**/*.ts',
  html: appRoot + '**/*.html',
  css: appRoot + '**/*.css',
  style: 'styles/**/*.css',
  output: outputRoot,
  exportSrv: exporSrvtRoot,
  doc: './doc',
  e2eSpecsSrc: 'test/e2e/src/**/*.ts',
  e2eSpecsDist: 'test/e2e/dist/',
  dtsSrc: [
    './typings/browser/**/*.d.ts',
    './custom_typings/**/*.d.ts',
    './jspm_packages/**/*.d.ts'
  ],
  dtsSrcEs6: [
    './typings/browser/**/*.d.ts',
    '!./typings/browser/**/*es6*/*.d.ts',
    './custom_typings/chosen.d.ts',
    './jspm_packages/**/*.d.ts'
  ],
  packageName: pkg.name,
  packageVersion: pkg.version
}
