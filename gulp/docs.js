const gulp = require('gulp')
const pug = require('gulp-pug')
const replace = require('gulp-replace')

// HTML
const htmlclean = require('gulp-htmlclean')
const typograf = require('gulp-typograf')

// SASS
const sass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')
const autoprefixer = require('gulp-autoprefixer')
const csso = require('gulp-csso')

const server = require('gulp-server-livereload')
const clean = require('gulp-clean')
const fs = require('fs')
const gulpSquoosh = require('gulp-squoosh')
const path = require('path')
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
const ffmpeg = require('fluent-ffmpeg')

// SVG
const svgsprite = require('gulp-svg-sprite')

gulp.task('clean:docs', function (done) {
	if (fs.existsSync('./docs/')) {
		return gulp.src('./docs/', { read: false }).pipe(clean({ force: true }))
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

gulp.task('pug:docs', function () {
	const mergedContent = mergeAllJSON('./src/contents')
	return gulp
		.src([
			'./src/pug/**/*.pug',
			'!./**/blocks/**/*.*',
			'!./src/pug/docs/**/*.*',
			'!./src/pug/components/**/*.*',
			'!./src/pug/base/**/*.*',
			'!./src/layout.html',
		])
		.pipe(changed('./docs/'))
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
		.pipe(gulp.dest('./docs/'))
})

gulp.task('sass:docs', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./docs/css/'))
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
		.pipe(gulp.dest('./docs/css/'))
})

gulp.task('imagesSquoosh', function () {
	return gulp
		.src('src/assets/images/**/*.{jpg,png,gif,webp}')
		.pipe(gulp.dest('temp/images'))
		.on('end', function () {
			// Применяем сжатие к каждому изображению с помощью Squoosh
			gulp
				.src('temp/images/**/*.{jpg,png,gif,webp}')
				.pipe(
					gulpSquoosh({
						encodeOptions: {
							webp: {
								quality: 75,
							},
							jpeg: {
								quality: 75,
							},
							png: {
								compressionLevel: 8,
							},
						},
					})
				)
				.pipe(gulp.dest('./docs/assets/images/'))
		})
})

// gulp.task('imagesTinypng', function() {
// 	return gulp
// 		.src('./src/assets/images/**/*.{png,jpg,jpeg}')
// 		.pipe(
// 			tinypng({
// 				key: '', // Замените на ваш ключ API от TinyPNG
// 				parallel: true,
// 				parallelMax: 5, // Максимальное количество параллельных запросов
// 			})
// 		)
// 		.pipe(gulp.dest('./docs/assets/images/'))
// })

// Пути к файлам
const fontsSrc = './src/assets/fonts/**/*.{ttf,otf,woff,woff2}'
const fontsDest = './docs/assets/fonts'

gulp.task('fonts:docs', function () {
	return gulp.src(fontsSrc).pipe(gulp.dest(fontsDest))
})

const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
}

const svgSymbol = {
	mode: {
		symbol: {
			sprite: '../sprite.symbol.svg',
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

gulp.task('svgStack:docs', function () {
	return gulp
		.src('./src/assets/images/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./docs/assets/images/svgsprite/'))
})

gulp.task('svgSymbol:docs', function () {
	return gulp
		.src('./src/assets/images/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./docs/assets/images/svgsprite/'))
})

gulp.task('files:docs', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'))
})

gulp.task('js:docs', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
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
		.pipe(gulp.dest('./docs/js/'))
})

gulp.task('videos:dev', function () {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync('./build/assets/videos/')) {
			fs.mkdirSync('./build/assets/videos/', { recursive: true })
		}

		const tasks = []

		gulp
			.src('./src/assets/videos/*.*')
			.pipe(gulp.dest('./build/assets/videos/'))
			.on('end', () => {
				Promise.all(tasks).then(resolve).catch(reject)
			})
	})
})

const serverOptions = {
	livereload: true,
	open: true,
}

gulp.task('server:docs', function () {
	return gulp.src('./docs/').pipe(server(serverOptions))
})
