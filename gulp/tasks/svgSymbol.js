import { getPaths } from '../config/paths.js'
import plumberNotify from '../config/plumberNotify.js'

import gulp from 'gulp'
import plumber from 'gulp-plumber'
import svgsprite from 'gulp-svg-sprite'

function svgSymbolTask() {
	const paths = getPaths()
	const svgSymbol = {
		mode: {
			symbol: {
				sprite: paths.svg.sprite,
			},
		},
		shape: {
			transform: [
				{
					svgo: {
						js2svg: { indent: 4, pretty: true },
						plugins: [],
					},
				},
			],
		},
	}
	return gulp
		.src(paths.svg.src)
		.pipe(plumber(plumberNotify('SVG')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest(paths.images.dest))
}

export default svgSymbolTask
