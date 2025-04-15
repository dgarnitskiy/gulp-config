import paths from '../config/paths.js'

import gulp from 'gulp'
import server from 'gulp-server-livereload'

const serverOptions = {
	livereload: true,
	open: true,
}

function serverTask() {
	return gulp.src(paths.dest).pipe(server(serverOptions))
}

export default serverTask
