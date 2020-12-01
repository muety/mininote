// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import { createApp } from 'vue'
import './assets/css/style.css'

import App from './App.vue'
import { useStore } from './store'

createApp(App).use(useStore()).mount('#app')
