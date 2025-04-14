const gulp = require('gulp')
const pug = require('gulp-pug')
const replace = require('gulp-replace')


const htmlclean = require('gulp-htmlclean')
const typograf = require('gulp-typograf')

const sass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')
const autoprefixer = require('gulp-autoprefixer')
const csso = require('gulp-csso')

const server = require('gulp-server-livereload')
const clean = require('gulp-clean')
const fs = require('fs')
const squoosh = require('gulp-squoosh')
const sourceMaps = require('gulp-sourcemaps')
const groupMedia = require('gulp-group-css-media-queries')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const webpack = require('webpack-stream')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const changed = require('gulp-changed')
const tinypng = require('gulp-tinypng-compress')
const svgsprite = require('gulp-svg-sprite')

const paths = {
	pug: {
		pages: './src/pug/pages/*.pug',
	},
	images: {
		src: ['./src/assets/images/**/*', '!./src/assets/images/icons/**/*'],
		build: './build/assets/images/',
		docs: './docs/assets/images/'
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
	docs: './docs/'
}

gulp.task('clean:docs', function(done) {
	if (fs.existsSync(paths.docs)) {
		return gulp.src(paths.docs, { read: false }).pipe(clean({ force: true }))
	}
	done()
})

const plumberNotify = title => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	}
}

// json
function mergeAllJSON(dir) {
	const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'))

	let mergedData = {}

	files.forEach(file => {
		const filePath = `${dir}/${file}`
		const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
		mergedData = { ...mergedData, ...jsonData }
	})

	return mergedData
}

//  pug
gulp.task('pug:docs', function() {
	const mergedContent = mergeAllJSON(paths.json)
	return gulp
		.src(paths.pug.pages)
		.pipe(changed(paths.docs))
		.pipe(plumber(plumberNotify('Pug')))
		.pipe(pug({ locals: mergedContent, pretty: true }))
		.pipe(
			replace(
				/(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|videos)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1./$4$5$7$1'
			)
		)
		.pipe(
			typograf({
				locale: ['ru', 'en-US'],
				htmlEntity: { type: 'digit' },
				safeTags: [
					['<\\?php', '\\?>'],
					['<no-typography>', '</no-typography>'],
				],
			})
		)
		.pipe(htmlclean())
		.pipe(gulp.dest(paths.docs))
})

// styles
gulp.task('sass:docs', function() {
	return gulp
		.src(paths.scss.src)
		.pipe(changed(paths.scss.docs))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
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
		.pipe(gulp.dest(paths.scss.docs))
})

// images
gulp.task('imagesSquoosh', function() {
	return gulp
		.src(paths.images.src)
		.pipe(changed(paths.images.docs))
		.pipe(
			squoosh({
				encodeOptions: {
					webp: {
						quality: 75,
					},
				},
			})
		)
		.pipe(gulp.dest(paths.images.docs))
})

// gulp.task('imagesTinypng', function() {
// 	return gulp
// 		.src(paths.images.src)
// 		.pipe(
// 			tinypng({
// 				key: '', // Замените на ваш ключ API от TinyPNG
// 				parallel: true,
// 				parallelMax: 5, // Максимальное количество параллельных запросов
// 			})
// 		)
// 		.pipe(gulp.dest(paths.images.docs))
// })

// fonts
gulp.task('fonts:docs', function() {
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.docs))
})


// svg
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
					plugins: [
						{
							name: 'removeAttrs',
							params: {
								attrs: '(fill|stroke)',
							},
						},
					],
				},
			},
		],
	},
}

gulp.task('svgSymbol:docs', function() {
	return gulp
		.src(paths.svg.src)
		.pipe(plumber(plumberNotify('SVG')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest(paths.images.docs))
})

// files
gulp.task('files:docs', function() {
	return gulp
		.src(paths.files.src)
		.pipe(changed(paths.files.docs))
		.pipe(gulp.dest(paths.files.docs))
})

// js
gulp.task('js:docs', function() {
	return gulp
		.src(paths.js.src)
		.pipe(changed(paths.js.docs))
		.pipe(
			plumber(
				notify.onError({
					message: '<%= error.message %>',
					title: 'JavaScript Error!',
				})
			)
		)
		.pipe(
			babel({
				presets: [['@babel/preset-env', { modules: false }]],
			})
		)
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js.docs))
})

// videos
gulp.task('videos:docs', function() {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(paths.videos.docs)) {
			fs.mkdirSync(paths.videos.docs, { recursive: true })
		}
		const tasks = []
		gulp
			.src(paths.videos.src)
			.pipe(gulp.dest(paths.videos.docs))
			.on('end', () => {
				Promise.all(tasks)
					.then(resolve)
					.catch(reject)
			})
	})
})

const serverOptions = {
	livereload: true,
	open: true,
}

gulp.task('server:docs', function() {
	return gulp.src(paths.docs).pipe(server(serverOptions))
})
