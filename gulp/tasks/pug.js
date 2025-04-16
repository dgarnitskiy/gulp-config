import Mode from '../config/mode.js'
import { getPaths } from '../config/paths.js'
import plumberNotify from '../config/plumberNotify.js'

import prettier from '@bdchauvette/gulp-prettier'
import gulp from 'gulp'
import changed from 'gulp-changed'
import htmlclean from 'gulp-htmlclean'
import plumber from 'gulp-plumber'
import pug from 'gulp-pug'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import typograf from 'gulp-typograf'

const { isDocs } = Mode()

function pugTask(content) {
	const paths = getPaths()
	const pugSetting = gulp
		.src(paths.pug.pages)
		.pipe(changed(paths.dest, { hasChanged: changed.compareContents })) // Проверка на изменения
		.pipe(plumber(plumberNotify('Pug'))) // Обработка ошибок
		.pipe(
			pug({
				locals: content,
				pretty: true, // Форматируем HTML для удобства чтения
			})
		)
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
	if (isDocs()) {
		return pugSetting.pipe(htmlclean()).pipe(gulp.dest(paths.dest))
	} else {
		return pugSetting
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
			.pipe(gulp.dest(paths.dest))
	}
}

export default pugTask
