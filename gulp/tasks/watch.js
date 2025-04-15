import filesTask from './files.js'
import fontsTask from './fonts.js'
import imagesTask from './images.js'
import jsTask from './js.js'
import pugTask from './pug.js'
import sassTask from './sass.js'
import svgSymbolTask from './svgSymbol.js'
import videosTask from './videos.js'

import gulp from 'gulp'

const watchPaths = {
	pug: './src/pug/**/*.pug',
	images: ['./src/assets/images/**/*', '!./src/assets/images/icons/'],
	scss: './src/scss/**/*.scss',
	fonts: './src/assets/fonts/**/*.{ttf,otf, woff, woff2}',
	svg: './src/assets/images/icons/**/*',
	files: './src/files/**/*',
	js: './src/js/**/*.js',
	videos: './src/assets/videos/**/*',
	json: './src/contents/**/*.json',
}

function watchTask() {
	gulp.watch(watchPaths.scss, gulp.parallel(sassTask))
	gulp.watch([watchPaths.pug, watchPaths.json], gulp.parallel(pugTask))
	gulp.watch(watchPaths.images, gulp.parallel(imagesTask))
	gulp.watch(watchPaths.videos, gulp.parallel(videosTask))
	gulp.watch(watchPaths.files, gulp.parallel(filesTask))
	gulp.watch(watchPaths.js, gulp.parallel(jsTask))
	gulp.watch(watchPaths.fonts, gulp.parallel(fontsTask))
	gulp.watch(watchPaths.svg, gulp.series(svgSymbolTask))
}

export default watchTask
