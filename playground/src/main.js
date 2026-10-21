import { createApp } from 'vue'
import App from './App.vue'
import CivicUI, { setColorMode, COLOR_MODES } from '../../src/index.js'

// Light by default, but the nav's ColorModeToggle (and a stored choice from an
// earlier visit) switch the whole playground to the dark color mode.
createApp(App).use(CivicUI, { colorMode: 'light' }).mount('#app')

// ?mode=dark|light|auto in the URL switches the mode on load: handy for
// sharing a link to a component in dark mode.
const requestedMode = new window.URLSearchParams(window.location.search).get('mode')
if (COLOR_MODES.includes(requestedMode)) setColorMode(requestedMode)
