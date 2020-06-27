const baseHandler = {
    get(target,key){
        const res = Reflect.get(target,key)
        track(target,key) //追踪依赖
        return typeof res === 'object'?reactive(res):res
        // 依赖收集
    },
    set(target,key,val){
        const info = {oldValue:target[key],newValue:val}
        Reflect.set(target,key,val)
        //响应式去通知变化
        trigger(target,key,info)
    }
}

function reactive(target){
   // vue3还需要考虑Map等对象
   const observed = new Proxy(target,baseHandler)
   // 返回Proxy代理后的对象
   return observed
}

function computed(fn){
   // 特殊的effect 
   // lazy首次不运行，更新才运行
   const runner = effect(fn,{computed:true,lazy:true})
   return {
       effect:runner,
       get value(){
           return runner()
       }
   }
}

// 收集依赖函数
function effect(fn,options={}){
    // 新建一个依赖的对象
   let e = createReactiveEffect(fn,options)
   // lazy是computed配置的属性
   if(!options.lazy){
       e()
   }
   return e
}

function createReactiveEffect(fn,options){
    //构造固定格式的effect
     const effect = function (...args){
         return run(effect,fn,args)
     }
     // effect的配置
     effect.deps = []
     effect.computed = options.computed
     effect.lazy = options.lazy
     return effect
     function run(effect,fn,args){
        // 执行effect
        if(effectStack.indexOf(effect) === -1){
            try {
                effectStack.push(effect)
                return fn(...args)
            } finally {
                effectStack.pop() //effect执行完毕以后
            }
        }
     }
}


// 收集依赖 
// 使用巨大的map对象来收集
// {
//   target1:{
//       key1:[依赖的函数1，依赖的函数2]，
//       key2:[依赖的函数1，依赖的函数2]，
//   },
//   target2:{
//       key1:[依赖的函数1，依赖的函数2]，
//       key2:[依赖的函数1，依赖的函数2]，
//   }
// }

let targetMap = new WeakMap()
let effectStack = [] //存储effect
function track(target,key){
    const effect = effectStack[effectStack.length-1]
    if(effect) {
        let depMap = targetMap.get(target)
        if(depMap === undefined) {
            depMap  = new WeakMap() // 单个target{}对象
            targetMap.set(target,depMap)
        }
        let dep = depMap.get(key)
        if(dep === undefined){
            dep = new Set()
            depMap.set(key,dep)
        }
        // 给key做新增依赖
        if(!dep.has(effect)){
            dep.add(effect)
            // 双向依赖。查找优化
            effect.deps.push(dep)
        }

    }
}

// 通知更新
function trigger(target,key,info){
 // 执行effect
 const depMap = targetMap.get(target)
 if(depMap === undefined) return
 // 普通的effect 和computed有一个优先级，
 // effect先执行 computed后
 // computed可能会依赖普通的Effect
 const effects = new Set()
 const computedRunners = new Set()
 if(key){
     let deps = depMap.get(key)
     deps.forEach(effect => {
         if(effect.computed){
            computedRunners.add(effect)
         }else{
             effects.add(effect)
         }        
     });
 }
 effects.forEach(effect=>effect())
 computedRunners.forEach(computedEffect=>computedEffect())
}