import mergeJSON from '../config/mergeJSON.js'
import { getPaths, watchPaths } from '../config/paths.js'
import filesTask from './files.js'
import fontsTask from './fonts.js'
import imagesTask from './images.js'
import jsTask from './js.js'
import pugTask from './pug.js'
import sassTask from './sass.js'
import svgSymbolTask from './svgSymbol.js'
import videosTask from './videos.js'

import gulp from 'gulp'

const paths = getPaths()
let mergedContent = mergeJSON(paths.json)

function embedJSON() {
	mergedContent = mergeJSON(paths.json)
	return mergedContent
}

function watchTask() {
	gulp.watch(watchPaths.scss, gulp.parallel(sassTask))
	gulp.watch(
		watchPaths.pug,
		gulp.parallel(() => pugTask(mergedContent))
	)
	gulp.watch(
		watchPaths.json,
		gulp.parallel(() => pugTask(embedJSON()))
	)
	gulp.watch(watchPaths.images, gulp.parallel(imagesTask))
	gulp.watch(watchPaths.videos, gulp.parallel(videosTask))
	gulp.watch(watchPaths.files, gulp.parallel(filesTask))
	gulp.watch(watchPaths.js, gulp.parallel(jsTask))
	gulp.watch(watchPaths.fonts, gulp.parallel(fontsTask))
	gulp.watch(watchPaths.svg, gulp.series(svgSymbolTask))
}

export default watchTask
