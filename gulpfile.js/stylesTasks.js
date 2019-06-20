const   {src, dest}     = require('gulp'),
        autoprefixer    = require('autoprefixer'),
        sass            = require('gulp-sass'),
        postcss         = require('gulp-postcss');
    
sass.compiler = require('node-sass');

// let styleFiles = './app/public/styles/**/*.scss';

//  scss styles task

function scssStyles(){
    return src('./app/public/styles/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer]))
        .pipe(dest('./app/public'))
};

exports.scssTask = scssStyles; 