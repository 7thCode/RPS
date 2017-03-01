'use strict';

var gulp = require('gulp');
var fs = require('fs');
var license = require('gulp-header');
//var typedoc = require("gulp-typedoc");
var rimraf = require('rimraf');
var imagemin = require('gulp-imagemin');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var sftp = require('gulp-sftp');

gulp.task('clean', (cb) => {
    rimraf('./product/chintai-keiei.net_ver2', cb);
});

gulp.task('copy', ['clean'], () => {
    return gulp.src(
        [
            'bin/*',
            'config/systems/config.json',
            'config/systems/logs.json',
            'config/services/**/*',
            'config/plugins/**/*',
            'config/applications/**/*',
            'config/utility/**/*',
            'persistent/**/*',
            'logs/*',
            'models/**/*.json',
            'public/css/**/*.css',
            'public/img/**/*',
            'public/js/**/*.js',
            'public/fonts/**/*',
            'public/vendor/**/*',
            'public/favicons/**/*',
            'public/systems/common/shape_edit/image/*',
            'server/systems/common/shape_edit/image/*',
            'public/systems/resources/**/*',
            'views/**/*.pug',
            'package.json',
            'bower.json',
            '.bowerrc'
        ],
        {base: '..'}
    )
        .pipe(gulp.dest('product'));
});

gulp.task('imgcpy',['copy'], () => {

    return gulp.src(
        [
            'config/systems/images/*.png',
            'public/img/**/*.jpg',
            'public/img/**/*.png',
            'public/applications/img/*.jpg',
            'public/applications/img/*.png',
            'public/systems/common/shape_edit/image/*.jpg',
            'public/systems/common/shape_edit/image/*.png',
            'server/systems/common/shape_edit/image/*.jpg',
            'server/systems/common/shape_edit/image/*.png',
        ],
        {base: '..'}
    )
        .pipe(gulp.dest('product'));
});

gulp.task('csscpy',['copy'], () => {

    return gulp.src(
        [
            'public/css/**/*.css',
            'public/systems/stylesheets/**/*.css',
            'public/services/stylesheets/**/*.css',
            'public/plugins/stylesheets/**/*.css',
            'public/applications/stylesheets/**/*.css',
            'public/utility/stylesheets/**/*.css',
        ],
        {base: '..'}
    )
        .pipe(gulp.dest('product'));
});

gulp.task('scriptcpy',['copy'], () => {

    var banner = [
        '/*',
        ' Copyright (c) 2016 7thCode.',
        ' Version: 1.0.0',
        ' Author: 7thCode.',
        ' License: MIT',
        ' Website: http://seventh-code.com',
        ' Issues: http://seventh-code.com',
        '*/',
        ''
    ].join('\n');

    return gulp.src(
        [
            'models/**/*.js',
            'public/*.js',
            'public/js/**/*.js',
            'public/utility/**/*.js',
            'public/applications/**/*.js',
            'public/plugins/**/*.js',
            'public/services/**/*.js',
            'public/systems/**/*.js',
            'server/**/*.js',
            'app.js',
            'core.js'
        ],
        {base: '..'}
    )

        .pipe(license(banner))
        .pipe(gulp.dest('product'));
});

gulp.task('debug build', ['imgcpy', 'csscpy', 'scriptcpy'], () => {
    console.log('debug build done');
});

gulp.task('imgmin',['copy'], () => {

    return gulp.src(
        [
            'config/systems/images/*.png',
            'public/img/**/*.jpg',
            'public/img/**/*.png',
            'public/applications/img/*.jpg',
            'public/applications/img/*.png',
            'public/systems/common/shape_edit/image/*.jpg',
            'public/systems/common/shape_edit/image/*.png',
            'server/systems/common/shape_edit/image/*.jpg',
            'server/systems/common/shape_edit/image/*.png',
        ],
        {base: '..'}
    )
        .pipe(imagemin())
        .pipe(gulp.dest('product'));
});

gulp.task('cssmin',['copy'], () => {

    return gulp.src(
        [
            'public/css/**/*.css',
            'public/systems/stylesheets/**/*.css',
            'public/services/stylesheets/**/*.css',
            'public/pluguns/stylesheets/**/*.css',
            'public/applications/stylesheets/**/*.css',
            'public/utility/stylesheets/**/*.css',
        ],
        {base: '..'}
    )
        .pipe(cssmin())
        .pipe(gulp.dest('product'));
});

gulp.task('scriptmin',['copy'], () => {

    var banner = [
        '/*',
        ' Copyright (c) 2016 7thCode.',
        ' Version: 1.0.0',
        ' Author: 7thCode.',
        ' License: MIT',
        ' Website: http://seventh-code.com',
        ' Issues: http://seventh-code.com',
        '*/',
        ''
    ].join('\n');

    return gulp.src(
        [
            'models/**/*.js',
            'public/*.js',
            'public/js/**/*.js',
            'public/utility/**/*.js',
            'public/applications/**/*.js',
            'public/services/**/*.js',
            'public/plugins/**/*.js',
            'public/systems/**/*.js',
            'server/**/*.js',
            'app.js',
            'core.js'
        ],
        {base: '..'}
    )
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(license(banner))
        .pipe(gulp.dest('product'));
});

gulp.task('production', ['imgmin', 'cssmin', 'scriptmin'], () => {
    console.log('production done');
});

gulp.task('default', ['production'], () => {
    console.log('default done');
});

//gulp.task("typedoc", function() {
//    return gulp
//        .src(["./**/*.ts"])
//        .pipe(typedoc({
//            target: "es5",
//            includeDeclarations: false,
//            out: "product/document",
//            name: "chintai2",
//            ignoreCompilerErrors: true,
//            version: true,
//        }));
//});
