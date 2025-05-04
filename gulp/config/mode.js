function Mode() {
	let _currentMode = 'dev'

	const setMode = mode => {
		_currentMode = mode || 'dev'
	}

	const isDocs = () => {
		return _currentMode === 'docs'
	}
	const isHs = () => {
		return _currentMode === 'hs'
	}

	return { isDocs, isHs, setMode }
}

export default Mode
