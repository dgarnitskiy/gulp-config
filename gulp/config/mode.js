let currentMode = 'dev'

function setMode(mode) {
	currentMode = mode
}

function isDocs() {
	return currentMode === 'docs'
}

export { isDocs, setMode }
