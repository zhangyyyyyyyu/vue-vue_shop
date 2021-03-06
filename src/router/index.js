import Vue from 'vue'
import VueRouter from 'vue-router'
//import Login from '../components/Login.vue'
//import Home from '../components/Home.vue'
//import Welcome from '../components/Welcome.vue'
//import User from '../components/user/User.vue'
//import Rights from '../components/power/Rights.vue'
//import Roles from '../components/power/Roles.vue'
//import Cate from '../components/goods/Cate.vue'
//import List from '../components/goods/List.vue'
//import Params from '../components/goods/Params.vue'
//import Add from '../components/goods/Add.vue'
//import Order from '../components/order/Order.vue'
//import Report from '../components/report/Report.vue'

// 路由懒加载
const Login = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

const User = () =>
    import ( /* webpackChunkName: "User_Rights_Roles" */ '../components/user/User.vue')
const Rights = () =>
    import ( /* webpackChunkName: "User_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () =>
    import ( /* webpackChunkName: "User_Rights_Roles" */ '../components/power/Roles.vue')

const Cate = () =>
    import ( /* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () =>
    import ( /* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

const List = () =>
    import ( /* webpackChunkName: "List_Add" */ '../components/goods/List.vue')
const Add = () =>
    import ( /* webpackChunkName: "List_Add" */ '../components/goods/Add.vue')

const Order = () =>
    import ( /* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () =>
    import ( /* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: User },
            { path: '/rights', component: Rights },
            { path: '/roles', component: Roles },
            { path: '/categories', component: Cate },
            { path: '/goods', component: List },
            { path: '/params', component: Params },
            { path: '/goods/add', component: Add },
            { path: '/orders', component: Order },
            { path: '/reports', component: Report }
        ]
    }
]


const router = new VueRouter({
    routes
})


// 挂载路由导航守卫
/*router.beforeEach((to, from, next) => {
    // to表将要访问的路径,from表从哪个路径来,next是一个函数表示放行
    // next() 放行   next('/xxx') 强制跳转到/xxx页面
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})*/

export default router