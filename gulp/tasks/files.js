import { getPaths } from '../config/paths.js'

import gulp from 'gulp'
import changed from 'gulp-changed'

function filesTask() {
	const paths = getPaths()
	return gulp
		.src(paths.files.src)
		.pipe(changed(paths.files.dest))
		.pipe(gulp.dest(paths.files.dest))
}

export default filesTask
