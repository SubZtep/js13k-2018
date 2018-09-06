const
	path = require('path'),
	gulp = require('gulp'),
	pug = require('gulp-pug'),
	minify = require('gulp-babel-minify'),
	concat = require('gulp-concat')

gulp.task('html', () => {
	return gulp.src(path.join(__dirname, './src/pug/index.pug'))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(path.join(__dirname, './dist')))
})

gulp.task('js', () => {
	return gulp.src([
		path.join(__dirname, './src/js/shaders/**/*.js'),
		path.join(__dirname, './src/js/components/**/*.js'),
		path.join(__dirname, './src/js/classes/**/*.js')
	])
		.pipe(concat('core.js'))
		//.pipe(minify({plugins: ["minify-mangle-names"]}))
		//.pipe(minify())
		.pipe(gulp.dest(path.join(__dirname, './dist')))
})

gulp.task('watch', () => {
	gulp.watch(
		'src/pug/**/*.pug',
		gulp.parallel('html')
	)
	gulp.watch(
		'src/js/**/*.js',
		gulp.parallel('js')
	)
})

gulp.task('default', gulp.parallel('js', 'html', done => {
	done()
}))
