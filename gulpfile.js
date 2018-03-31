var syntax        = 'sass'; // Syntax: sass or scss;

const gulp          = require('gulp');
const gutil         = require('gulp-util' );
const sass          = require('gulp-sass');
const browsersync   = require('browser-sync');
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify');
const cleancss      = require('gulp-clean-css');
const rename        = require('gulp-rename');
const autoprefixer  = require('gulp-autoprefixer');
const notify        = require("gulp-notify");
const rsync         = require('gulp-rsync');

gulp.task('browser-sync', function() {
  browsersync({
    server: {
      baseDir: 'src'
    },
    notify: false,
    // open: false,
    // tunnel: true,
    // tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
  })
});

gulp.task('styles', function() {
  return gulp.src('src/'+syntax+'/**/*.'+syntax+'')
  .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer(['last 15 versions']))
  .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
  .pipe(gulp.dest('src/css'))
  .pipe(browsersync.reload( {stream: true} ))
});

gulp.task('js', function() {
  return gulp.src([
    'src/libs/jquery/dist/jquery.min.js',
    'src/js/common.js', // Always at the end
    ])
  .pipe(concat('scripts.min.js'))
  // .pipe(uglify()) // Mifify js (opt.)
  .pipe(gulp.dest('src/js'))
  .pipe(browsersync.reload({ stream: true }))
});

gulp.task('rsync', function() {
  return gulp.src('src/**')
  .pipe(rsync({
    root: 'src/',
    hostname: 'username@yousite.com',
    destination: 'yousite/public_html/',
    // include: ['*.htaccess'], // Includes files to deploy
    exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
    recursive: true,
    archive: true,
    silent: false,
    compress: true
  }))
});

gulp.task('watch', ['styles', 'js', 'browser-sync'], function() {
  gulp.watch('src/'+syntax+'/**/*.'+syntax+'', ['styles']);
  gulp.watch(['libs/**/*.js', 'src/js/common.js'], ['js']);
  gulp.watch('src/*.html', browsersync.reload)
});

gulp.task('default', ['watch']);