# mvvmvue
## vue工作机制
>在new vue()之后，vue会调用进行初始化，初始化生命周期、事件、props、methods、data、computed及watche等
>其中最重要的是Object.defineProperty设置setter及getter,用来实现[响应式]以及[依赖收集]
>初始化之后调用$mount挂载组件
>通过编译compile()函数生成渲染函数 
>编译三阶段
>1.parse: 使用正则解析template中的vue指令(v-xxx)变量等等 形成抽象语法树AST
>2.optimize:标记一些静态节点，用作后面的性能优化，在diff的时候直接略过
>3.generate: 把第一部分生成的AST转化成渲染函数render function
```js
   //返回的是虚拟Dom树
   render(h){
       //attrs 原生属性
       return h('table',{attrs:{border:1}},[children])
   }
```
>渲染函数
>1.touch 依赖收集 data中的数据与视图中的哪些部分绑定 将来data中的数据变化就通知视图的相应的部分发生改变
>2.render 生成Virtual DOM Tree ---> 打补丁包函数(patch) ---> 生成真实的DOM
## defineProperty
```js
   //数据劫持 当读'xxx'时触发get函数 当设置'xxx'值触发set函数
   Object.defineProperty(obj,'属性名xxx',{
       get(){

       },
       set(newVal){
       }
   })
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
