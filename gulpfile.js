/* jshint camelcase: false, jquery: false */
'use strict';

var config = {
  styles: 'styles',
  styles_app: 'app.scss',
  styles_styleguide: 'styleguide.scss',
  scripts: 'scripts',
  images: 'images',
  icons: 'app/iconfont',
  fonts: 'fonts',
  browsers: [
    'last 2 versions',
    '> 2%',
    'Explorer 8'
  ]
};

var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var path        = require('path');
var del         = require('del');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var styleguide  = require('./styleguide');


gulp.task('styles', function () {
  return gulp.src([
      path.join('app', config.styles, config.styles_app),
      path.join('app', config.styles, config.styles_styleguide)
    ])
    .pipe($.plumber())
    .pipe($.rubySass({
      // sourcemap: true,
      debugInfo: true,
      style: 'expanded',
      precision: 5
    }))
    .pipe($.autoprefixer(config.browsers))
    .pipe(gulp.dest(path.join('.tmp', config.styles)))
    .pipe($.size({title: 'styles'}));
});


gulp.task('scripts', function () {
  return gulp.src([
      path.join('app', config.scripts, '**/*.js'),
      path.join('!app', config.scripts, 'lib/**/*.js')
    ])
    .pipe($.plumber())
    .pipe($.jshint())
    .pipe($.jshint.reporter(require('jshint-stylish')))
    .pipe($.size({title: 'scripts'}));
});


gulp.task('views', function () {
  return gulp.src([
      'app/views/pages/**/*.ect',
      '!**/_*.ect'
    ])
    .pipe($.plumber())
    .pipe($.consolidate('ect'))
    .pipe($.rename(function (file) {
      file.extname = '.html';
    }))
    .pipe($.if('**/styleguide/**/*',
      $.layoutize({
        templatePath: 'app/views/layouts/body.ect',
        engine: 'ect',
        locals: {
          styleguide: true
        }
      }),
      $.layoutize({
        templatePath: 'app/views/layouts/body.ect',
        engine: 'ect',
        locals: {}
      })
    ))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'views'}));
});


gulp.task('styleguide', function () {
  var render = function (files, navitems, sections, dest) {
    return gulp.src('app/views/layouts/styleguide.ect')
      .pipe($.consolidate('ect', {
        files: files,
        navitems: navitems,
        sections: sections
      }))
      .pipe($.rename(function (file) {
        file.dirname += dest.split('app/views/pages/styleguide')[1];
        file.basename = 'index';
        file.extname = '.html';
      }))
      .pipe(gulp.dest('.tmp/styleguide'));
  };
  var filter = {
    md:     $.filter('**/*.md'),
    markup: $.filter('**/*.ect'),
    css:    $.filter('**/*.css'),
    scss:   $.filter('**/*.scss')
  };
  var clone = {
    css:    $.clone.sink(),
    scss:   $.clone.sink()
  };

  return gulp.src('app/views/pages/styleguide/**')
    .pipe($.plumber())
    .pipe(filter.md)
    .pipe($.markdown())
    .pipe($.rename(function (file) {
      file.extname = '.md';
    }))
    .pipe(filter.md.restore())

    .pipe(filter.css)
    .pipe(clone.css)
    .pipe(gulp.dest('.tmp/styleguide'))
    .pipe(clone.css.tap())
    .pipe(filter.css.restore())

    .pipe(filter.scss)
    .pipe(clone.scss)
    .pipe($.rubySass({
      loadPath: [path.join('app', config.styles)],
      style: 'compressed',
      precision: 5
    }))
    .pipe(gulp.dest('.tmp/styleguide'))
    .pipe(clone.scss.tap())
    .pipe(filter.scss.restore())

    .pipe(filter.markup)
    .pipe($.consolidate('ect'))
    .pipe($.prettify({
      indent_size: 2,
      no_preserve_newlines: true,
      unformatted: ''
    }))
    .pipe(filter.markup.restore())

    .pipe($.util.buffer(function (err, files) {
      styleguide(files, render);
    }));
});


gulp.task('assets', ['styles', 'scripts'], function () {
  return gulp.src([
      'app/**/*',
      '!app/iconfont',
      '!app/iconfont/**/*',
      '!app/views',
      '!app/views/**/*',
      '!app/**/*.scss'
    ])
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'assets'}));
});


gulp.task('html', ['assets', 'views', 'styleguide'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app,node_modules}'});

  return gulp.src('.tmp/**/*.html')
    .pipe(assets)
    .pipe($.if('**/*.js', $.uglify()))
    .pipe($.if('**/*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});


gulp.task('images', function () {
  return gulp.src(path.join('app', config.images, '**/*'))
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(path.join('dist', config.images)))
    .pipe($.size({title: 'images'}));
});


gulp.task('fonts', function () {
  return gulp.src(path.join('app', config.fonts, '**/*.{eot,svg,ttf,woff}'))
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});


gulp.task('iconfont', function () {
  var fontName = 'sg-icons';

  return gulp.src(path.join(config.icons, 'icons/*.svg'))
    .pipe($.imagemin({
      svgoPlugins: [{
        convertShapeToPath: true,
        mergePaths: true
      }]
    }))
    .pipe($.iconfont({
      fontName: fontName,
      fontHeight: 512,
      normalize: true,
      fixedWidth: false,
      descent: 8,
      appendCodepoints: false
    }))
    // https://github.com/cognitom/symbols-for-sketch#config
    .on('codepoints', function(codepoints) {
      var options = {
        glyphs: codepoints,
        fontName: fontName
      };

      gulp.src(path.join(config.icons, 'scss.ect'))
        .pipe($.consolidate('ect', options))
        .pipe($.rename('icons.scss'))
        .pipe(gulp.dest(path.join('app', config.styles)));

      gulp.src(path.join(config.icons, 'icons.*.ect'))
        .pipe($.consolidate('ect', options))
        .pipe($.rename(function (file) {
          file.extname = '';
        }))
        .pipe(gulp.dest('app/views/pages/styleguide/00-global'));
    })
    .pipe($.rename(function(file) {
      file.basename += '-normal';
    }))
    .pipe(gulp.dest(path.join('app', config.fonts)))
    .pipe($.size({title: 'iconfont'}));
});


gulp.task('clean', del.bind(null, ['.tmp', 'dist']));


gulp.task('build', ['html', 'images', 'fonts'], function () {
  return gulp.src([
      '.tmp/styleguide/**/*.css'
    ])
    .pipe(gulp.dest('dist/styleguide'))
    .pipe($.size({title: 'build'}));
});


gulp.task('serve', ['views', 'styles', 'scripts', 'styleguide'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'app', 'node_modules']
    }
  });

  gulp.watch(path.join(config.icons, '**/*'), ['iconfont']);
  gulp.watch(path.join('app', config.styles, '**/*.scss'), ['styles']);
  gulp.watch(path.join('app', config.scripts, '**/*.js'), ['scripts']);
  gulp.watch('app/views/**/*.ect', ['views']);
  gulp.watch('app/views/pages/styleguide/**/*', ['styleguide']);

  gulp.watch([
    '.tmp/**/*.html',
    '!.tmp/styleguide/**/index.html',
    path.join('.tmp', config.styles, '**/*.css'),
    path.join('app', config.scripts, '**/*.js'),
    path.join('app', config.images, '**/*')
  ], reload);
});


gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
