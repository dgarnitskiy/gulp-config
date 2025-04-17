import Mode from './mode.js'

const { isDocs } = Mode()

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

function getPaths() {
	const dest = isDocs() ? './docs/' : './build/'

	return {
		pug: {
			pages: './src/pug/pages/*.pug',
		},
		images: {
			base: './src/assets/images',
			src: [
				'./src/assets/images/svg/**/*.svg',
				'./src/assets/images/favicons/**/*.ico',
			],
			webp: './src/assets/images/**/*.{jpeg,png,webp,jpg}',
			dest: `${dest}assets/images/`,
		},
		scss: {
			src: './src/scss/*.scss',
			dest: `${dest}css/`,
		},
		fonts: {
			src: 'src/assets/fonts/**/*.{ttf,otf,woff,woff2}',
			dest: `${dest}assets/fonts/`,
		},
		svg: {
			src: './src/assets/images/icons/**/*.svg',
			sprite: '../sprite.svg',
		},
		files: {
			src: './src/files/**/*',
			dest: `${dest}files/`,
		},
		js: {
			src: './src/js/**/*.js',
			dest: `${dest}js/`,
		},
		videos: {
			src: './src/assets/videos/**/*',
			dest: `${dest}assets/videos/`,
		},
		json: './src/contents/',
		dest,
	}
}

export { getPaths, watchPaths }
