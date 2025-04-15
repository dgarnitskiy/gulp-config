const paths = {
	pug: {
		pages: './src/pug/pages/*.pug',
	},
	images: {
		src: ['./src/assets/images/**/*', '!./src/assets/images/icons/**/*'],
		build: './build/assets/images/',
		docs: './docs/assets/images/',
	},
	scss: {
		src: './src/scss/*.scss',
		build: './build/css/',
		docs: './docs/css/',
	},
	fonts: {
		src: 'src/assets/fonts/**/*.{ttf,otf,woff,woff2}',
		build: './build/assets/fonts/',
		docs: './docs/assets/fonts/',
	},
	svg: {
		src: './src/assets/images/icons/**/*.svg',
		sprite: '../sprite.svg',
	},
	files: {
		src: './src/files/**/*',
		build: './build/files/',
		docs: './docs/files/',
	},
	js: {
		src: './src/js/**/*.js',
		build: './build/js/',
		docs: './docs/js/',
	},
	videos: {
		src: './src/assets/videos/**/*',
		build: './build/assets/videos/',
		docs: './docs/assets/videos/',
	},
	json: './src/contents/',
	build: './build/',
	docs: './docs/',
}

const watchPaths = {
	pug: './src/pug/**/*.pug',
	images: ['./src/assets/images/**/*', '!./src/assets/images/icons/**/*'],
	scss: './src/scss/**/*.scss',
	fonts: './src/assets/fonts/**/*.{ttf,otf, woff, woff2}',
	svg: './src/assets/images/icons/**/*',
	files: './src/files/**/*',
	js: './src/js/**/*.js',
	videos: './src/assets/videos/**/*',
	json: './src/contents/**/*.json',
}