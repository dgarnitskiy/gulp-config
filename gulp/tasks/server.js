import { getPaths } from '../config/paths.js'

import gulp from 'gulp'
import server from 'gulp-server-livereload'

const serverOptions = {
	livereload: true,
	open: true,
}

function serverTask() {
	const paths = getPaths()
	return gulp.src(paths.dest).pipe(server(serverOptions))
}

export default serverTask
