import { isDocs } from './mode.js'

const dest = isDocs() ? './docs/' : './build/'

const paths = {
	pug: {
		pages: './src/pug/pages/*.pug',
	},
	images: {
		src: ['./src/assets/images/svg/**/*', './src/assets/images/favicons/**/*'],
		webp: [
			'./src/assets/images/**/*.{jpeg,png,webp,jpg}',
			'!./src/assets/images/icons/',
			'!./src/assets/images/svg/',
			'!./src/assets/images/favicons/',
		],
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

export default paths
