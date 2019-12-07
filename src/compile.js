class Compile{
    //vm vue实例， el挂载的数组元素
    constructor(el,vm){
        this.$vm=vm;//Kvue实例
        this.$el=document.querySelector(el);

        if(this.$el){
            //将#app标签里的内容都移动到fragment里面 dom操作会提高效率
            this.$fragment=this.node2Fragment(this.$el);
            //编译模板的内容同时进行依赖收集
            this.compile(this.$fragment);
            this.$el.appendChild(this.$fragment);
        }
    }
    node2Fragment(el){
        //原生js 生成一个fragment标签
        const fragment = document.createDocumentFragment();
        let child;
        while(child = el.firstChild) {
            console.log(el.firstChild);
            fragment.appendChild(child);
        }
        
        return fragment;   
    }
    compile(el){
       //el.childNodes是text p div的数组
       const childNodes=el.childNodes;
       console.log('chidNodes',childNodes);
       Array.from(childNodes).forEach(node=>{
           if(node.nodeType === 1){
               //1 element节点
                //console.log('编译元素节点'+node.nodeName); 
                this.CompileElement(node);  
           }else if(this.isInterPolation(node)){
               //是否是插值表达式
                 //console.log('编译插值文本'+node.textContent);  
                this.compileText(node);

            }

        //递归子节点
        if(node.childNodes && node.childNodes.length > 0){
            console.log("node.childNodes",node.childNodes);
             this.compile(node);
        }
       })
    }
    isInterPolation(node){
        //是文本且符合{{}}正则
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
    CompileElement(node){
        //<div k-text="test" @click="onClick"> 拿出属性
        let nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr=>{
            const attrName = attr.name; //k-text @click
            const exp = attr.value; //test onClick
            if(this.isDirectTive(attrName)){
                const dir=attrName.substring(2);//截出text
                this[dir] && this[dir](node,this.$vm,exp);
            }
            if(this.isEvent(attrName)){
                const dir = attrName.substring(1);//截出click
                this.eventHandler(node, this.$vm, exp, dir);
            }
        })

    }
    eventHandler(node, vm, exp,dir){
          const fn = vm.$options.methods && vm.$options.methods[exp];
          if(dir && fn){
              //事件监听 dir-click change....
               node.addEventListener(dir, fn.bind(vm));
          }

    }
    
    text(node, vm, exp){
        this.update(node, vm, exp, 'text');
    }

    isDirectTive(attr){
        return attr.indexOf('k-') === 0;
    }

    isEvent(attr){
        return attr.indexOf('@') === 0;
    }

    compileText(node){
        //RegExp.$1 正则表达式{{name}}里的name值
        this.update(node,this.$vm,RegExp.$1,'text');
    }
   
    update(node, vm, exp, dir) {
        let updateFn = this[dir + 'Updator'];
        //vm[exp] 设置了代理 可以拿到data里面key为exp的value值
        updateFn && updateFn(node, vm[exp]);
        //依赖收集
        new Watcher(vm, exp, function(value){
            updateFn && updateFn(node, value);
        })
    }
    
    textUpdator(node, val){
        node.textContent = val;
    }

    html(node, vm, exp){
        this.update(node, vm, exp, 'html');
    }
    
    htmlUpdator(node, value){
        node.innerHTML = value;
    }
    
    model(node, vm, exp){
        // data-view
        this.update(node, vm, exp, 'model');
        // view-data
        node.addEventListener('input', e => {
            vm[exp] = e.target.value;
        });

    }
    modelUpdator(node, value){
        node.value = value;
    }


}