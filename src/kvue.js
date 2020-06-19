class KVue{
    constructor(options){
        this.$options = options;
        //处理data
        this.$data = options.data;
        //响应化
        this.observe(this.$data);
        // new Watcher();
        // this.$data.test;//
        // new Watcher();
        // this.$data.food;
        // new Watcher();
        // this.$data.test;
        new Compile(options.el,this);
        if(options.created){
            options.created.call(this);
        }

    }
    observe(value){
        if(!value || typeof value !== 'object') return;
         Object.keys(value).forEach(key=>{
             this.defineReactive(value,key,value[key]);
             //代理到vm上
             this.proxyData(key);
         })
    }
    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key];
            },
            set(newVal){
               this.$data[key]=newVal; 
            }
        })  

    }

    defineReactive(obj,key,val){//产生了对value值的闭包，
        //每个key都有一个dep依赖,一个dep里面有多个watch
        const dep=new Dep(); 
        //给obj添加了key的属性,并且key带有两个方法get与set
        Object.defineProperty(obj,key,{
            get(){
                //将Dep.target添加到dep中
                Dep.target && dep.addDep(Dep.target)
                return val;
            },
            set(newVal){
                if(newVal !== val){ 
                    val = newVal;//set函数是对闭包变量进行修改
                    //让变量的修改能被感知到

                    //通知key对应的所有watcher更新
                    dep.notify();
                }
            }
        })
        //递归 data里面有个对象
        this.observe(val);
    }
}

//与data中的属性是一对一的关系
class Dep{
    constructor(){
        this.deps=[];//里面有同一个key对应的多个watch
    }
    addDep(dep){
        this.deps.push(dep);
    }
    notify(){
        //观察者模式 通知key对应的所有依赖(watcher)进行更新
        this.deps.forEach(dep=>dep.update());
    }
}

class Watcher{
    constructor(vm, key, cb){
        this.vm=vm;
        this.key=key;
        this.cb=cb;
        Dep.target=this; // 只要调用get就会生成一个与之对应的watch
        this.vm[this.key];// 触发get函数读一下key对应的属性 ，就是将watcher添加到dep中
        Dep.target=null
        console.log(Dep.target);
    } 
    update(){
        //console.log('属性更新了');
        this.cb.call(this.vm,this.vm[this.key]);
    }
}