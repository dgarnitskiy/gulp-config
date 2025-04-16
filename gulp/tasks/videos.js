import { getPaths } from '../config/paths.js'

import fs from 'fs'
import gulp from 'gulp'

function videosTask() {
	const paths = getPaths()
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(paths.videos.dest)) {
			fs.mkdirSync(paths.videos.dest, { recursive: true })
		}

		const tasks = []

		gulp
			.src(paths.videos.src)
			.pipe(gulp.dest(paths.videos.dest))
			.on('end', () => {
				Promise.all(tasks)
					.then(resolve)
					.catch(reject)
			})
	})
}

export default videosTask
