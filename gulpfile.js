'use strict';

var gulp = require('gulp'),
	tsc = require('gulp-typescript'),
	babel = require('gulp-babel'),
	tsProject = tsc.createProject('tsconfig.json');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');
var through = require('through2');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
	
gulp.task('ts-es6', function(){
	return gulp.src("*.ts")
			.pipe(sourcemaps.init())
			.pipe(tsc(tsProject))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest("./dist/es6/"));
});	

gulp.task('build', ['ts-es6'], function(){
	var bundledStream = through();

	bundledStream
		// turns the output bundle stream into a stream containing
		// the normal attributes gulp plugins expect.
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add gulp plugins to the pipeline here.
		// .pipe(uglify())
		.on('error', gutil.log)
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest('./dist/js/'));
	
	// "globby" replaces the normal "gulp.src" as Browserify
	// creates it's own readable stream.
	globby(['./dist/es6/*.js']).then(function(entries) {
	// create the Browserify instance.
		var b = browserify({
			entries: entries,
			debug: true,
			transform: [['babelify', {
				presets: ["es2015"],
				plugins: ["transform-runtime"]
			}]]
		});
		
		// pipe the Browserify stream into the stream we created earlier
		// this starts our gulp pipeline.
		b.bundle().pipe(bundledStream);
	}).catch(function(err) {
		// ensure any errors from globby are handled
		bundledStream.emit('error', err);
	});
	
	// finally, we return the stream, so gulp knows when this task is done.
	return bundledStream;
});