import { setMode } from './gulp/config/mode.js'
import cleanTask from './gulp/tasks/clean.js'
import filesTask from './gulp/tasks/files.js'
import fontsTask from './gulp/tasks/fonts.js'
import imagesTask from './gulp/tasks/images.js'
import jsTask from './gulp/tasks/js.js'
import pugTask from './gulp/tasks/pug.js'
import sassTask from './gulp/tasks/sass.js'
import serverTask from './gulp/tasks/server.js'
import svgSymbolTask from './gulp/tasks/svgSymbol.js'
import videosTask from './gulp/tasks/videos.js'
import watchTask from './gulp/tasks/watch.js'

import gulp from 'gulp'

const build = gulp.parallel(
	pugTask,
	sassTask,
	imagesTask,
	videosTask,
	fontsTask,
	svgSymbolTask,
	filesTask,
	jsTask
)

gulp.task(
	'default',
	gulp.series(
		cleanTask,
		done => {
			setMode('dev')
			done()
		},
		build,
		gulp.parallel(serverTask, watchTask)
	)
)

gulp.task(
	'docs',
	gulp.series(
		cleanTask,
		done => {
			setMode('docs')
			done()
		},
		build,
		gulp.parallel(serverTask)
	)
)
