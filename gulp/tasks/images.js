import { getPaths } from '../config/paths.js'
import plumberNotify from '../config/plumberNotify.js'

import gulp from 'gulp'
import changed from 'gulp-changed'
import plumber from 'gulp-plumber'
import sharpResponsive from 'gulp-sharp-responsive'

function imagesTask(done) {
	const paths = getPaths()
	function skipImages() {
		return gulp
			.src(paths.images.src, { base: paths.images.base })
			.pipe(plumber(plumberNotify('Images')))
			.pipe(changed(paths.images.dest))
			.pipe(gulp.dest(paths.images.dest))
	}
	function webp1x() {
		return gulp
			.src(paths.images.webp)
			.pipe(plumber(plumberNotify('Webp')))
			.pipe(changed(paths.images.dest))
			.pipe(
				sharpResponsive({
					formats: [
						{
							format: 'webp',
							quality: 90,
						},
					],
				})
			)
			.pipe(gulp.dest(paths.images.dest))
	}
	function webp2x() {
		return gulp
			.src(paths.images.webp)
			.pipe(plumber(plumberNotify('Webp2x')))
			.pipe(changed(paths.images.dest))
			.pipe(
				sharpResponsive({
					formats: [
						{
							format: 'webp',
							width: metadata => metadata.width * 2,
							height: metadata => metadata.height * 2,
							rename: { suffix: '@2x' },
							quality: 90,
						},
					],
				})
			)
			.pipe(gulp.dest(paths.images.dest))
	}
	return gulp.parallel(skipImages, webp1x, webp2x)(done)
}

export default imagesTask
