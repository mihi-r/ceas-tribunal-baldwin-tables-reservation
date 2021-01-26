const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const purge = require('gulp-css-purge');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const tsify = require('tsify');
const es = require('event-stream');
const sourcemaps = require('gulp-sourcemaps');
const version = require('gulp-version-number');

const versionConfig = {
  'value': '%MDS%',
  'append': {
    'key': 'v',
    'to': ['css', 'js']
  }
};

const styles = function () {
  return gulp
    .src('./styles/*.css')
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(purge({
      trim: true,
      shorten: true,
      verbose: true,
    }))
    .pipe(rename(function(path){
      path.basename += ".min"
      path.extname = ".css"
    }))
    .pipe(gulp.dest('./build/'));
}

const scripts = function () {
  const entryFiles = ['scripts/main.ts'];

  const tasks = entryFiles.map((entryFile) => {
    return browserify({
      basedir: '.',
      debug: true,
      entries: [entryFile],
      cache: {},
      packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source(entryFile))
    .pipe(rename({
        extname: '.bundle.js'
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
  });

  return es.merge.apply(null, tasks).pipe(gulp.dest('build'));
}

const views = function () {
  return gulp
    .src('./views/*.html')
    .pipe(version(versionConfig))
    .pipe(gulp.dest('./views/'));
};

const watchFiles = function () {
  gulp.watch(['./scripts/*.ts', './scripts/*/*.ts'], gulp.series(scripts, views));
  gulp.watch('./styles/*.css', gulp.series(styles, views));
}

const watch = gulp.parallel(scripts, styles, watchFiles);
const build = gulp.parallel(views, scripts, styles);

exports.watch = watch;
exports.build = build;
