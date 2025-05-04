import { execSync, spawn } from 'child_process'
import fs from 'fs'
import gulp from 'gulp'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import mergeStream from 'merge-stream'
import minimist from 'minimist'
import { getPaths } from '../config/paths.js'

const paths = getPaths()

function getModulePaths() {
	const options = minimist(process.argv.slice(2))
	const modulePath = options.module

	if (!modulePath) {
		console.error('Укажи имя модуля через --module')
		process.exit(1)
	}
	return {
		modulePath,
		hsPath: {
			hs: `./hs/${modulePath}`,
			assets: `./hs/assets`,
		},
	}
}

// Create folder

function prepareModule(done) {
	const { hsPath } = getModulePaths()
	// Проверка, нужно ли создавать модуль
	if (fs.existsSync(hsPath.hs)) {
		return done()
	}

	// Создание модуля интерактивно через CLI
	const child = spawn('hs', ['create', 'module', `${hsPath.hs}`], {
		stdio: 'inherit',
		shell: true,
	})

	child.on('exit', code => {
		if (code !== 0) {
			console.warn('Возможно, создание модуля не удалось.')
		}
		done()
	})
}

//  update HTML/CSS/JS/assets
function updateCode() {
	const { hsPath } = getModulePaths()
	const html = gulp
		.src(`${paths.dest}*.html`)
		.pipe(
			replace(
				/(["'])(?:\.{0,2}\/)?(?:assets\/)(?:images|fonts|videos)(?:\/[^"']+)*\/([^\/"']+\.[\w|#]+)\1/g,
				"$1{{ module_asset_url('$2') }}$1"
			)
		)
		.pipe(rename('module.html'))
		.pipe(gulp.dest(hsPath.hs))

	const css = gulp
		.src(`${paths.dest}css/*.css`)
		.pipe(
			replace(
				/url\((["'])(?:\.{0,2}\/)?(?:assets\/)(?:images|fonts|videos)(?:\/[^"']+)*\/([^\/"']+\.[\w|#]+)\1\)/g,
				"url($1{{ module_asset_url('$2') }}$1)"
			)
		)
		.pipe(rename('module.css'))
		.pipe(gulp.dest(hsPath.hs))

	const js = gulp
		.src(`${paths.dest}js/*.js`)
		.pipe(rename('module.js'))
		.pipe(gulp.dest(hsPath.hs))

	const images = gulp.src(
		`${paths.dest}assets/images/**/*.{png,jpg,jpeg,webp,svg,gif}`
	)
	const fonts = gulp.src(`${paths.dest}assets/fonts/**/*.{woff,woff2,ttf,otf}`)

	const allAssets = mergeStream(images, fonts)
		.pipe(rename({ dirname: '' }))
		.pipe(gulp.dest(hsPath.assets))

	return mergeStream(html, css, js, allAssets)
}

// Upload to HS
function uploadToHubSpot(done) {
	const { modulePath, hsPath } = getModulePaths()
	try {
		execSync(`hs upload ${hsPath.hs} hs-modules/${modulePath}`, {
			stdio: 'inherit',
		})
	} catch (err) {
		console.error('Ошибка при загрузке модуля:', err.message)
	}
	done()
}

// export
export const hsTask = gulp.series(prepareModule, updateCode, uploadToHubSpot)
