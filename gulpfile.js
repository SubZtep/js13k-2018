const
	prod = process.env.NODE_ENV === 'production',
	path = require('path'),
	gulp = require('gulp'),
	pug = require('gulp-pug'),
	concat = require('gulp-concat'),
	preprocess = require('gulp-preprocess'),
	minify = require('gulp-babel-minify'),
	gulpif = require('gulp-if')

gulp.task('html', () => {
	return gulp.src(path.join(__dirname, './src/pug/index.pug'))
		.pipe(pug({
			verbose: true,
			pretty: !prod,
			globals: [prod]
		}))
		.pipe(preprocess())
		.pipe(gulp.dest(path.join(__dirname, './dist')))
})

gulp.task('js', () => {
	return gulp.src([
		path.join(__dirname, './src/js/shaders/**/*.js'),
		path.join(__dirname, './src/js/components/**/*.js'),
		path.join(__dirname, './src/js/classes/**/*.js')
	])
		.pipe(concat('a.js'))
		.pipe(preprocess())
		.pipe(gulpif(prod, minify({
			removeConsole: true
		})))
		.pipe(gulp.dest(path.join(__dirname, './dist')))
})

gulp.task('watch', gulp.parallel('html', 'js', () => {
	gulp.watch(
		'src/pug/**/*.pug',
		gulp.parallel('html')
	)
	gulp.watch(
		'src/js/**/*.js',
		gulp.parallel('js')
	)
}))

gulp.task('default', gulp.parallel('js', 'html', done => {
	done()
}))
