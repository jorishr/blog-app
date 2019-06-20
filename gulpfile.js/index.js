const   { series, watch, parallel, src, dest} = require('gulp'),
        nodemon     = require('nodemon'),
        browserSync = require('browser-sync'),
        stylesTasks = require('./stylesTasks');

//  WATCH TASK 

let styleFiles = './app/public/styles/**/*.scss';
let htmlFiles = './app/views/**/*.ejs';

function startNodemon (cb) {
    let called = false;
    return nodemon({
        // nodemon our expressjs server
        script: './app/app.js',
        // watch core server file(s) that require server restart on change
        watch: ['./app/app.js']
    })
    .on('start', function onStart() {
        // ensure start only got called once
        if (!called) { cb(); }
        called = true;
    })
    .on('restart', function onRestart() {
        // reload connected browsers after a slight delay
        setTimeout(function reload() {
            browserSync.reload({
                stream: false
            });
        }, 1000);
    });
};

function startBrowserSync (){
    browserSync({
      // informs browser-sync to proxy our expressjs app 
      proxy: 'http://localhost:3000',
      // informs browser-sync to use the following port for the proxied app
      // notice that the default port is 3000, which would clash with our expressjs
      port: 4000
    });
};

function bsReload(cb) {
    browserSync.reload({
        stream: false
    });
    cb();
};

function watchFiles(){
    watch(styleFiles, series(stylesTasks.scssTask, bsReload));
    watch(htmlFiles, bsReload);
};

exports.watch = parallel(series(startNodemon, startBrowserSync), watchFiles);
