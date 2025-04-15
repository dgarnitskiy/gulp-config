import getPaths from '../config/paths.js'

import gulp from 'gulp'

function fontsTask() {
	const paths = getPaths()
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest))
}
export default fontsTask
