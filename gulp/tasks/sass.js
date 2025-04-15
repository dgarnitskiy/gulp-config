import { isDocs } from '../config/mode.js'
import paths from '../config/paths.js'
import plumberNotify from '../config/plumberNotify.js'

import gulp from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import changed from 'gulp-changed'
import csso from 'gulp-csso'
import groupMedia from 'gulp-group-css-media-queries'
import plumber from 'gulp-plumber'
import replace from 'gulp-replace'
import gulpSass from 'gulp-sass'
import sassGlob from 'gulp-sass-glob'
import sourceMaps from 'gulp-sourcemaps'
import dartSass from 'sass'

const sass = gulpSass(dartSass)

function sassTask() {
	const sassSetting = gulp
		.src(paths.scss.src)
		.pipe(changed(paths.scss.dest))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
	if (isDocs()) {
		return sassSetting
			.pipe(autoprefixer())
			.pipe(groupMedia())
			.pipe(
				replace(
					/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|videos)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
					'$1$2$3$4$6$1'
				)
			)
			.pipe(csso())
			.pipe(sourceMaps.write())
			.pipe(gulp.dest(paths.scss.dest))
	} else {
		return sassSetting
			.pipe(
				replace(
					/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|videos)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
					'$1$2$3$4$6$1'
				)
			)
			.pipe(sourceMaps.write())
			.pipe(gulp.dest(paths.scss.dest))
	}
}
export default sassTask
