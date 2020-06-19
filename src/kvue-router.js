//声明插件 实现install的静态方法  
let Vue; //保存Vue构造函数引用  不对其产生直接的依赖 也不需要再一次引入Vue

class KVueRouter {
  //解析routers
  //监听事件
  //声明组件
  constructor(options){
     this.$options = options;
     this.routeMap = {};//{'/index':{component:Index}}
     //当前的url需要是响应式的
     this.app = new Vue({
         data:{current:'/'}
     })
  }
  init(){
      this.bindEvents();
      this.createRouteMap();
      this.initComponent()
  }
  bindEvents(){
      window.addEventListener('hashchange',this.onhashchange.bind(this))
  }
  onhashchange(){
      //修改current路由
      this.app.current = window.location.hash.slice(1) || '/'
  }
  createRouteMap(){
      // 遍历用户配置的数组 通过地址可以拿出配置对象
      this.$options.routes.forEach(route=>{
          this.routeMap[route.path] = route
      })
  }
  initComponent(){
      //全局的声明组件，会在组件初始化全局api时，将该组件重新注册成为一个构造函数存入组件的components中
      //转为a标签 <a href="#/">xxx</a>
      Vue.Component('router-link',{
          props:{
              to: String
          },
          render:(h)=>{ 
              // h(tag,data,children)
             return h('a',{
                 //href不是一般的属性，是他的特性
                 attrs:{href:'#' + this.to}
                },
                [this.$slots.default]
             )
          }
      })
      Vue.Component('router-view',{
          render:(h)=>{
              //箭头函数保留this指向
              // 使用函数式组件，将需要的参数从上下文中拿到
              const Component = this.routeMap[this.app.current]
              return h(Component)
          }
      })
  }
}
//参数是Vue的构造函数
KVueRouter.install = function (_Vue) {
    Vue = _Vue
    //实现一个混入操作  把自定的代码混入进入组件的生命钩子中
    // 为什么需要使用混入 因为在执行Vue.use(Router)时，组件实例还不存在，将混入延后操作
    Vue.mixin({
        beforeCreate() {
            // 获取KVueRouter实例，并挂载到Vue.prototype
            // 此时的this是被混入的那个组件
            // 只在根组件beforeCreate时执行一次
            if(this.$options.router){
                 Vue.prototype.$router = this.$options.router;
                 this.$router.router.init()
            }
           
        }
    })
}
export default KVueRouter