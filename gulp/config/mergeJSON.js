import fs from 'fs'

export default function mergeJSON(dir) {
	const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'))

	let mergedData = {}

	files.forEach(file => {
		const filePath = `${dir}/${file}`
		const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
		mergedData = { ...mergedData, ...jsonData }
	})

	return mergedData
}
