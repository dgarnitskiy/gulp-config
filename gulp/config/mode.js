let currentMode

function setMode(mode) {
	currentMode = mode
}

function isDocs() {
	return currentMode === 'docs'
}

export { isDocs, setMode }
