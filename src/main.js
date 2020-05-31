// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI);
//添加tree-table组件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',TreeTable)
//添加VueQuillEditor组件
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//导入浏览器顶部加载进度条

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
  
Vue.use(VueQuillEditor)
//让其兼容IE浏览器
import "babel-polyfill"




import './assets/css/quanju.css'

import axios from 'axios'
axios.defaults.baseURL ='http://127.0.0.1:8888/api/private/v1/'
//axios.defaults.baseURL ='http://39.97.184.183:8888/api/private/v1/'


//挂载请求拦截器
//每次发送请求时调用NProgress.start()
axios.interceptors.request.use(config=>{
  //console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token') ;
  NProgress.start()
  //最后必须return config
  return config
})
//每次发送请求结束时调用NProgress.done()
axios.interceptors.response.use(config=>{
  NProgress.done()
  return config
})


Vue.prototype.$http=axios
Vue.config.productionTip = false
/* eslint-disable no-new */


Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
