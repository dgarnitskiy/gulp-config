function Mode() {
	let _currentMode = 'dev'

	const setMode = mode => {
		_currentMode = mode || 'dev'
	}

	const isDocs = () => {
		return _currentMode === 'docs'
	}

	return { isDocs, setMode }
}

export default Mode
