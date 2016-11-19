var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var deploy = require('gulp-gh-pages');

gulp.task('default', ['sass', 'jquery', 'vendor', 'scripts']);

gulp.task('jquery', function() {
    gulp.src('./node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('vendor', function() {
    gulp.src(['./node_modules/material-design-lite/dist/material.min.js'])
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('scripts', function() {
    gulp.src('./resources/js/**/*.js')
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('sass', function() {
    return gulp.src('./resources/scss/**/*.scss')
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(gulp.dest('./public/assets/css'));
});

gulp.task('watch', function() {
    gulp.watch('./resources/scss/**/*.scss', ['sass']);
    gulp.watch('./resources/js/**/*.js', ['scripts']);
});

gulp.task('deploy', ['default'], function() {
    return gulp.src("./public/**/*")
        .pipe(deploy())
});