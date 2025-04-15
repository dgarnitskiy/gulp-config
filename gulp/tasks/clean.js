import paths from '../config/paths.js'

import fs from 'fs'
import gulp from 'gulp'
import clean from 'gulp-clean'

function cleanTask(done) {
	if (fs.existsSync(paths.dest)) {
		return gulp.src(paths.dest, { read: false }).pipe(clean({ force: true }))
	}
	done()
}

export default cleanTask
