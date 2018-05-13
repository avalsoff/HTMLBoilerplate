"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minifycss = require("gulp-csso");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");
var rigger = require("gulp-rigger");
var concat = require("gulp-concat");
var run = require("run-sequence");
var del = require("del");
// var ghPages = require("gulp-gh-pages");

// CLEAN BUILD

gulp.task("clean", function() {
  return del("build");
});

// HTML

gulp.task("html", function() {
  return gulp.src("src/*.html")
    .pipe(rigger())
    .pipe(gulp.dest("build"));
});

// CSS

gulp.task("style", function() {
  gulp.src("src/scss/main.scss")
    .pipe(plumber())
    .pipe(sass({
      includePaths: require("node-normalize-scss").includePaths
    }))
    .pipe(postcss([
      autoprefixer(),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minifycss())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

// JS
gulp.task("js:del", function() {
  return del("build/js");
});


gulp.task("js", ["js:del"], function() {
  gulp.src([
    "src/js/*.js" // At the end
    ])
    .pipe(plumber())
    .pipe(concat("index.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

// FONTS

gulp.task("fonts:del", function() {
  return del("build/fonts");
});

gulp.task("fonts", ["fonts:del"], function() {
  return gulp.src("src/fonts/**/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts/"));
});

// FAVICON

gulp.task("favicons:del", function() {
  return del("build/img/favicons");
});

gulp.task("favicon", ["favicons:del"], function() {
  return gulp.src("src/img/favicons/**")
    .pipe(gulp.dest("build/img/favicons/"));
});

// IMAGES

gulp.task("img:del", function() {
  return del("build/img/*.*");
});

gulp.task("img:copy", ["img:del"], function() {
  return gulp.src("src/img/*.*")
    .pipe(gulp.dest("build/img/"));
});

gulp.task("img:minify", ["img:copy"], function() {
  return gulp.src("build/img/**/*.{png,jpg,gif,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

// WEBP

gulp.task("webp:del", function() {
  return del("build/img/content");
});

gulp.task("webp:copy", ["webp:del"], function() {
  return gulp.src("src/img/content/*.{png,jpg}")
    .pipe(gulp.dest("build/img/content"));
});

gulp.task("webp:convert", ["webp:copy"], function() {
  return gulp.src("src/build/img/content/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img/content"));
});

// SVG-SPRITE

gulp.task("svg-sprite:del", function() {
  return del("build/img/svg-sprite");
});

gulp.task("svg-sprite", ["svg-sprite:del"], function() {
  return gulp.src("src/img/svg-sprite/*.svg")
    .pipe(gulp.dest("build/img/svg-sprite"))
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});


//GH-PAGES

// gulp.task("deploy", function() {
//   return gulp.src("build/**/*")
//     .pipe(ghPages());
// });


// LIVE SERVER

gulp.task("serve", function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("src/scss/**/*.scss", ["style"]);
  gulp.watch("src/*.html", ["html", server.reload]);
  gulp.watch("src/js/*.js", ["js", server.reload]);
  gulp.watch("src/img/favicons/**", ["favicon", server.reload]);
  gulp.watch("src/img/*.*", ["img:minify", server.reload]);
  gulp.watch("src/img/content/*.{png,jpg}", ["webp:convert", server.reload]);
  gulp.watch("src/fonts/*.*", ["fonts", server.reload]);
  gulp.watch("src/img/svg-sprite/**", ["svg-sprite", server.reload]);
});

// BUILD

gulp.task("build", function(done) {
  run(
    "clean",
    "html",
    "style",
    "js",
    "fonts",
    "favicon",
    "img:minify",
    "webp:convert",
    "svg-sprite",
    done
  );
});

// DEFAULT

gulp.task("default", ["serve"]);