const gulp = require('gulp')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')
const server = require('gulp-server-livereload')
const clean = require('gulp-clean')
const fs = require('fs')
const sourceMaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const webpack = require('webpack-stream')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const changed = require('gulp-changed')
const typograf = require('gulp-typograf')
const svgsprite = require('gulp-svg-sprite')
const replace = require('gulp-replace')
const prettier = require('@bdchauvette/gulp-prettier')
const squoosh = require('gulp-squoosh')
const { log } = require('console')

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
	images: ['./src/assets/images/**/*', '!./src/assets/images/icons/'],
	scss: './src/scss/**/*.scss',
	fonts: './src/assets/fonts/**/*.{ttf,otf, woff, woff2}',
	svg: './src/assets/images/icons/**/*',
	files: './src/files/**/*',
	js: './src/js/**/*.js',
	videos: './src/assets/videos/**/*',
	json: './src/contents/**/*.json',
}

// clean
gulp.task('clean:dev', function(done) {
	if (fs.existsSync(paths.dest)) {
		return gulp.src(paths.dest, { read: false }).pipe(clean({ force: true }))
	}
	done()
})
// notify
const plumberNotify = title => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	}
}
// pug + json
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

gulp.task('pug:dev', function() {
	const mergedContent = mergeAllJSON(paths.json)
	return gulp
		.src(paths.pug.pages) // Игнорируем блоки и папку docs
		.pipe(changed(paths.build, { hasChanged: changed.compareContents })) // Проверка на изменения
		.pipe(plumber()) // Обработка ошибок
		.pipe(
			pug({
				locals: mergedContent,
				pretty: true, // Форматируем HTML для удобства чтения
			})
		)
		.pipe(
			replace(
				/(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|videos)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1./$4$5$7$1'
			) // Заменяем относительные пути
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
		.pipe(
			prettier({
				tabWidth: 2,
				useTabs: true,
				printWidth: 182,
				trailingComma: 'es5',
				bracketSpacing: false,
			})
		)
		.pipe(rename({ dirname: '' }))
		.pipe(gulp.dest(paths.build))
})

// sass
gulp.task('sass:dev', function() {
	return gulp
		.src(paths.scss.src)
		.pipe(changed(paths.scss.build))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(
			replace(
				/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|videos)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1$2$3$4$6$1'
			)
		)
		.pipe(sourceMaps.write())
		.pipe(gulp.dest(paths.scss.build))
})

// images
function skipImages() {
	return gulp
		.src(paths.images.src)
		.pipe(changed(paths.images.build))
		.pipe(gulp.dest(paths.images.build))
}
function webp1x() {
	return gulp
		.src(paths.images.webp)
		.pipe(changed(paths.images.build))
		.pipe(
			squoosh({
				encodeOptions: {
					webp: { quality: 80 },
				},
			})
		)
		.pipe(gulp.dest(paths.images.build))
}
function webp2x() {
	return gulp
		.src(paths.images.webp)
		.pipe(changed(paths.images.build))
		.pipe(
			squoosh(({ width, height }) => {
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
			})
		)
		.pipe(
			rename(path => {
				path.basename += '@2x'
			})
		)
		.pipe(gulp.dest(paths.images.build))
}

gulp.task('images:dev', gulp.parallel(skipImages, webp1x, webp2x))

// fonts
gulp.task('fonts:dev', function() {
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.build))
})

// svgSymbol
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

gulp.task('svgSymbol:dev', function() {
	return gulp
		.src(paths.svg.src)
		.pipe(plumber(plumberNotify('SVG')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest(paths.images.build))
})

// files
gulp.task('files:dev', function() {
	return gulp
		.src(paths.files.src)
		.pipe(changed(paths.files.build))
		.pipe(gulp.dest(paths.files.build))
})

// js
gulp.task('js:dev', function() {
	return gulp
		.src(paths.js.src)
		.pipe(changed(paths.js.build))
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
		.pipe(gulp.dest(paths.js.build))
})

// videos
gulp.task('videos:dev', function() {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(paths.videos.build)) {
			fs.mkdirSync(paths.videos.build, { recursive: true })
		}

		const tasks = []

		gulp
			.src(paths.videos.src)
			.pipe(gulp.dest(paths.videos.build))
			.on('end', () => {
				Promise.all(tasks)
					.then(resolve)
					.catch(reject)
			})
	})
})

// server
const serverOptions = {
	livereload: true,
	open: true,
}

gulp.task('server:dev', function() {
	return gulp.src(paths.build).pipe(server(serverOptions))
})

// watch
gulp.task('watch:dev', function() {
	gulp.watch(watchPaths.scss, gulp.parallel('sass:dev'))
	gulp.watch([watchPaths.pug, watchPaths.json], gulp.parallel('pug:dev'))
	gulp.watch(watchPaths.images, gulp.parallel('images:dev'))
	gulp.watch(watchPaths.videos, gulp.parallel('videos:dev'))
	gulp.watch(watchPaths.files, gulp.parallel('files:dev'))
	gulp.watch(watchPaths.js, gulp.parallel('js:dev'))
	gulp.watch(watchPaths.fonts, gulp.parallel('fonts:dev'))
	gulp.watch(watchPaths.svg, gulp.series('svgSymbol:dev'))
})
