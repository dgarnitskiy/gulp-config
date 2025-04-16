import fs from 'fs'
import path from 'path'

export default function mergeJSON(dir) {
	let mergedData = {}

	function readDir(currentDir) {
		const entries = fs.readdirSync(currentDir, { withFileTypes: true })

		entries.forEach(entry => {
			const fullPath = path.join(currentDir, entry.name)

			if (entry.isDirectory()) {
				readDir(fullPath)
			} else if (entry.isFile() && fullPath.endsWith('.json')) {
				const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
				mergedData = { ...mergedData, ...jsonData }
			}
		})
	}

	readDir(dir)

	return mergedData
}
