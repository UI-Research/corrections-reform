var gulp = require('gulp');  
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');  

//scripts
var jsFiles = ['js/main.js', 'js/mobilegraphs.js'],  
    jsDest = 'dist/';

gulp.task('scripts', function() {  
    return gulp.src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

//libs
var libFiles = ['lib/jquery-2.2.1.min.js', 'lib/bootstrap.min.js', 'lib/d3.v3.min.js', 'lib/topojson.min.js', 
'lib/graph-scroll.js', 'lib/modernizr.svg.min.js', 'lib/header.js'],  
    libDest = 'dist/';

gulp.task('libs', function() {  
    return gulp.src(libFiles)
        .pipe(concat('libs.js'))
        .pipe(gulp.dest(libDest))
        .pipe(rename('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(libDest));
});