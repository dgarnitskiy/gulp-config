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
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

gulp.task('clean:dev', function (done) {
	if (fs.existsSync('./build/')) {
		return gulp.src('./build/', { read: false }).pipe(clean({ force: true }))
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

// Пути для исходных и выходных файлов
const pugSrc = [
	'./src/pug/**/*.pug',
	'!./**/blocks/**/*.*',
	'!./src/pug/docs/**/*.*',
	'!./src/pug/components/**/*.*',
	'!./src/pug/base/**/*.*',
	'!./src/layout.html',
] // Путь к Pug файлам
const pugDest = './build/' // Папка для вывода HTML

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

gulp.task('pug:dev', function () {
	const mergedContent = mergeAllJSON('./src/contents')
	return gulp
		.src(pugSrc) // Игнорируем блоки и папку docs
		.pipe(changed(pugDest, { hasChanged: changed.compareContents })) // Проверка на изменения
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
		.pipe(gulp.dest(pugDest)) // Выводим скомпилированные HTML в build/
})

gulp.task('sass:dev', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./build/css/'))
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
		.pipe(gulp.dest('./build/css/'))
})

gulp.task('images:dev', function () {
	return gulp
		.src(['./src/assets/images/**/*', '!./src/assets/images/icons/**/*'])
		.pipe(changed('./build/assets/images/'))
		.pipe(gulp.dest('./build/assets/images/'))
})

// Пути к файлам
const fontsSrc = 'src/assets/fonts/**/*.{ttf,otf,woff,woff2}'
const fontsDest = './build/assets/fonts/'

gulp.task('fonts:dev', function () {
	return gulp.src(fontsSrc).pipe(gulp.dest(fontsDest))
})

const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					js2svg: { indent: 4, pretty: true },
				},
			},
		],
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
					js2svg: { indent: 4, pretty: true },
					plugins: [],
				},
			},
		],
	},
}

gulp.task('svgStack:dev', function () {
	return gulp
		.src('./src/assets/images/icons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./build/assets/images/svgsprite/'))
})

gulp.task('svgSymbol:dev', function () {
	return gulp
		.src('./src/assets/images/icons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./build/assets/images/svgsprite/'))
})

gulp.task('files:dev', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./build/files/'))
		.pipe(gulp.dest('./build/files/'))
})

gulp.task('js:dev', function () {
	return (
		gulp
			.src('./src/js/*.js')
			.pipe(changed('./build/js/'))
			.pipe(plumber(plumberNotify('JS')))
			// .pipe(babel())
			.pipe(webpack(require('./../webpack.config.js')))
			.pipe(gulp.dest('./build/js/'))
	)
})
gulp.task('js:dev', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./build/js/'))
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
		.pipe(gulp.dest('./build/js/'))
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

gulp.task('server:dev', function () {
	return gulp.src('./build/').pipe(server(serverOptions))
})

gulp.task('watch:dev', function () {
	gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'))
	gulp.watch(
		['./src/pug/**/*.pug', './src/pug/**/*.json'],
		gulp.parallel('pug:dev')
	)
	gulp.watch('./src/assets/images/**/*', gulp.parallel('images:dev'))
	gulp.watch('./src/assets/videos/**/*', gulp.parallel('videos:dev'))
	gulp.watch('./src/files/**/*', gulp.parallel('files:dev'))
	gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'))
	gulp.watch('./src/assets/fonts/**/*.{ttf,otf}', gulp.parallel('fonts:dev'))
	gulp.watch(
		'./src/assets/images/icons/*',
		gulp.series('svgStack:dev', 'svgSymbol:dev')
	)
})
