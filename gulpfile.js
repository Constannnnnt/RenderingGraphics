var gulp = require('gulp')
var fs = require('fs')
var child = require('child_process')
var os = require('os')
var osCMD = os.platform() === 'win32' ? '.cmd' : ''

gulp.task('dev', () => {
  var webpack = child.spawn('npm' + osCMD, ['start'])
  var server = child.spawn('node', ['server.js', '5411'])
  var webpackLog = fs.createWriteStream('./webpack.log', {flags: 'a'})
  var serverLog = fs.createWriteStream('./server.log', {flags: 'a'})
  webpack.stdout.pipe(webpackLog)
  webpack.stderr.pipe(webpackLog)
  server.stdout.pipe(serverLog)
  server.stderr.pipe(serverLog)
})