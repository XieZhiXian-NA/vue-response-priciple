let Vue;
class KVuex {
    // 持有state,并使其响应化
    // 实现commit等方法

    constructor(options){
      //this.state是vue的实例 直接访问this.state.xx
      this.state = new Vue({data:options.state})
      this.mutations = options.mutations;
      this.actions = options.actions;

      //当在actions中的函数的settimeout中使用上下文解构出来的commit方法时，此时this指向不再是当前的store放
      //当前的store对象，所以需要使用绑定this指向，使其的函数体内的this始终指向store
      this.commit = this.commit.bind(this);
      this.dispatch = this.dispatch.bind(this);
    }

    commit(type,arg){
        this.mutations[type](this.state,arg)
    }

    dispatch(type,arg){
      return  this.actions[type](this,arg)
    }
}

function install(_Vue){
  Vue = _Vue
  Vue.mixin({
      beforeCreate() {
          if(this.$options.store){
              Vue.prototype.$store = this.$options.store
          }
      },
  })

}

//导出Vuex
export default {
    Store,
    install
}