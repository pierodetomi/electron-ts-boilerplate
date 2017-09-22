var gulp = require("gulp");
var sass = require("gulp-sass");
var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var watch = require("gulp-watch");
var browserify = require('gulp-browserify');

var tsConfig = {
    noEmitOnError: true,
    lib: ["dom", "es2015", "es2015.iterable"],
    noImplicitAny: true,
    moduleResolution: "node",
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    outDir: "./app/"
};

gulp.task("ng-sass-build", function() {
    // Build Angular sass styles
    gulp.src("./src/ng/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("./app/ng"));
});

gulp.task("ng-html-copy", function() {
    // Copy html templates
    gulp.src(["./src/**/*.html"])
        .pipe(gulp.dest("./app"));
});

gulp.task("ng-build", ["ng-html-copy", "ng-sass-build"], function() {
    // Build Angular ts files
    gulp.src(["./src/ng/**/*.ts"])
        .pipe(ts(tsConfig))
        .pipe(sourcemaps.write(".", {includeContent: false}))
        .pipe(gulp.dest("./app/ng"));
    
    gulp.src(["./src/environments/**/*.ts"])
        .pipe(ts(tsConfig))
        .pipe(sourcemaps.write(".", {includeContent: false}))
        .pipe(gulp.dest("./app/environments"));

    // Build main ts files
    return gulp.src(["./src/*.ts"])
        .pipe(ts(tsConfig))
        .pipe(sourcemaps.write(".", {includeContent: false}))
        .pipe(gulp.dest("./app"));
});

gulp.task("ng-bundle", ["ng-build"], function() {
    // Bundle main JS files
    return gulp.src(["./app/*.js"])
        .pipe(browserify({
            insertGlobals : true,
            debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./app'));
});

gulp.task("sass", function() {
    // Build general sass styles
    gulp.src("./src/sass/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("./app/css"));
});

gulp.task("fonts", function() {
    gulp.src(["./src/fonts/**/*.*"])
        .pipe(gulp.dest("./app/fonts"));
})

gulp.task("default", ["fonts", "sass", "ng-bundle"], function() {
    watch("./src/**/*.ts", function() {
        gulp.run("ng-bundle");
    });
    
    watch(["./src/ng/**/*.scss"], function() {
        gulp.run("ng-sass-build");
    });

    watch(["./src/**/*.html"], function() {
        gulp.run("ng-html-copy");
    });

    watch(["./src/sass/**/*.scss"], function() {
        gulp.run("sass");
    });
});