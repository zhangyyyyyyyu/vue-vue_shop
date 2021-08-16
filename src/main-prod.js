import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
//import './plugins/element.js'
//导入全局样式列表
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//require styles导入富文本编辑器的样式
//import 'quill/dist/quill.core.css'
//import 'quill/dist/quill.snow.css'
//import 'quill/dist/quill.bubble.css'

//导入NProgress包对应的js和css
import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'

// 配置请求的根路径
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
    //在request拦截器中，展示进度条NProgress.start()
axios.interceptors.request.use(config => {
        NProgress.start()
        config.headers.Authorization = window.sessionStorage.getItem('token')
        return config
    })
    //在response拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
    NProgress.done()
    return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
    //将富文本编辑器注册为全局可用
Vue.use(VueQuillEditor)

//事件过滤器
Vue.filter('dataFormat', function(originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
        //第一个括号表示变为字符串形式，第二个括号中2表示时间要有两位数，0表示不足两位数的数字用0来补充
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')