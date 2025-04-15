import { isDocs } from '../config/mode.js'
import paths from '../config/paths.js'
import plumberNotify from '../config/plumberNotify.js'

import gulp from 'gulp'
import babel from 'gulp-babel'
import changed from 'gulp-changed'
import concat from 'gulp-concat'
import plumber from 'gulp-plumber'
import uglify from 'gulp-uglify'
import webpack from 'webpack-stream'
import webpackConfig from './../../webpack.config.js'

function jsTask() {
	const jsSetting = gulp
		.src(paths.js.src)
		.pipe(changed(paths.js.dest))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(
			babel({
				presets: [['@babel/preset-env', { modules: false }]],
			})
		)
		.pipe(webpack(webpackConfig))
		.pipe(concat('app.js'))
	if (isDocs()) {
		return jsSetting.pipe(uglify()).pipe(gulp.dest(paths.js.dest))
	} else {
		return jsSetting.pipe(gulp.dest(paths.js.dest))
	}
}
export default jsTask
