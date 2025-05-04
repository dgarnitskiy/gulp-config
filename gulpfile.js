import gulp from 'gulp'
import mergeJSON from './gulp/config/mergeJSON.js'
import Mode from './gulp/config/mode.js'
import { getPaths } from './gulp/config/paths.js'
import cleanTask from './gulp/tasks/clean.js'
import filesTask from './gulp/tasks/files.js'
import fontsTask from './gulp/tasks/fonts.js'
import { hsTask } from './gulp/tasks/hs.js'
import imagesTask from './gulp/tasks/images.js'
import jsTask from './gulp/tasks/js.js'
import pugTask from './gulp/tasks/pug.js'
import sassTask from './gulp/tasks/sass.js'
import serverTask from './gulp/tasks/server.js'
import svgSymbolTask from './gulp/tasks/svgSymbol.js'
import videosTask from './gulp/tasks/videos.js'
import watchTask from './gulp/tasks/watch.js'

const paths = getPaths()
let mergedContent = mergeJSON(paths.json)
const { setMode } = Mode()

function setDocsMode(done) {
	setMode('docs')
	done()
}
function setDevMode(done) {
	setMode('dev')
	done()
}
function setHSMode(done) {
	setMode('hs')
	done()
}

const buildTasks = [
	() => pugTask(mergedContent),
	sassTask,
	imagesTask,
	videosTask,
	fontsTask,
	svgSymbolTask,
	filesTask,
	jsTask,
]

gulp.task(
	'default',
	gulp.series(
		setDevMode,
		cleanTask,
		gulp.parallel(buildTasks),
		gulp.parallel(serverTask, watchTask)
	)
)

gulp.task(
	'docs',
	gulp.series(
		setDocsMode,
		cleanTask,
		gulp.parallel(buildTasks),
		gulp.parallel(serverTask)
	)
)

gulp.task('hs', gulp.series(setHSMode, cleanTask, ...buildTasks, hsTask))
