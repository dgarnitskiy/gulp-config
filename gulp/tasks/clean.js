import { getPaths } from '../config/paths.js'

import fs from 'fs'
import gulp from 'gulp'
import clean from 'gulp-clean'

// hs
import Mode from '../config/mode.js'
const { isHs } = Mode()

function cleanTask(done) {
	const paths = getPaths()
	if (fs.existsSync(paths.dest)) {
		return gulp.src(paths.dest, { read: false }).pipe(clean({ force: true }))
	}
	// hs
	if (isHs()) {
		if (fs.existsSync('./hs')) {
			return gulp.src('./hs', { read: false }).pipe(clean({ force: true }))
		}
	}
	done()
}

export default cleanTask
