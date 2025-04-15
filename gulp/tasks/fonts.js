import paths from '../config/paths.js'

import gulp from 'gulp'

function fontsTask() {
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest))
}
export default fontsTask
