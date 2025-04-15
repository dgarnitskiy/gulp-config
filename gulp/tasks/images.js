import paths from '../config/paths.js'
import plumberNotify from '../config/plumberNotify.js'

import gulp from 'gulp'
import changed from 'gulp-changed'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import squoosh from 'gulp-squoosh'

function skipImages() {
	return gulp
		.src(paths.images.src)
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
			squoosh(
				{
					encodeOptions: {
						webp: { quality: 80 },
					},
				},
				{ concurrency: 1 }
			)
		)
		.pipe(gulp.dest(paths.images.dest))
}
function webp2x() {
	return gulp
		.src(paths.images.webp)
		.pipe(plumber(plumberNotify('Webp2x')))
		.pipe(changed(paths.images.dest))
		.pipe(
			squoosh(
				({ width, height }) => {
					const originalWidth = width || undefined
					const originalHeight = height || undefined

					return {
						preprocessOptions: {
							resize: {
								width: originalWidth ? originalWidth * 2 : undefined,
								height: originalHeight ? originalHeight * 2 : undefined,
							},
						},
						encodeOptions: {
							webp: { quality: 90 },
						},
					}
				},
				{ concurrency: 1 }
			)
		)
		.pipe(
			rename(path => {
				path.basename += '@2x'
			})
		)
		.pipe(gulp.dest(paths.images.dest))
}

function imagesTask(done) {
	return gulp.parallel(skipImages, webp1x, webp2x)(done)
}

export default imagesTask
