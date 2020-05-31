import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login'
// import Hmoe from '@/components/home'
// import Welcome from '@/components/welcome'
// import Users from '@/components/user/users'
// import Right from '@/components/power/rights'
// import Roles from '@/components/power/roles'
// import Categories from '@/components/goods/categories'
// import Params from '@/components/goods/params'
// import Goods from '@/components/goods/goods'
// import AddGoods from '@/components/goods/addGoods'
// import Orders from '@/components/orders/orders'
// import Reports from '@/components/reports/reports'


Vue.use(Router)


const router =new Router({
  routes: [
    {path:'/',redirect:'/login'},
    {path: '/login',component: Login},
    {path: '/home',
    component: resolve=> require(["@/components/home"],resolve),
    redirect:'/welcome',
    children:[
      {path:'/welcome',component:resolve=> require(["@/components/welcome"],resolve)},
      {path:'/users',component:resolve=> require(["@/components/user/users"],resolve)},
      {path:'/rights',component:resolve=> require(["@/components/power/rights"],resolve)},
      {path:'/roles',component:resolve=> require(["@/components/power/roles"],resolve)},
      {path:'/categories',component:resolve=> require(["@/components/goods/categories"],resolve)},
      {path:'/params',component:resolve=> require(["@/components/goods/params"],resolve)},
      {path:'/orders',component:resolve=> require(["@/components/orders/orders"],resolve)},
      {path:'/reports',component:resolve=> require(["@/components/reports/reports"],resolve)},
      {path:'/goods',component:resolve=> require(["@/components/goods/goods"],resolve)},
      {path:'/addGoods',component:resolve=> require(["@/components/goods/addGoods"],resolve)},
    ]
    },
  ]
})


export default router;

// 挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  //to将要访问得路径
  //from 代表从哪个路径跳转而来
  //next 一个函数，表示放行 next()放行  next('/login') 强制跳转

  if(to.path==='/login') return next();

  const tokenStr=window.sessionStorage.getItem('token');
  if(!tokenStr) next('/login')
  next();
    

})

