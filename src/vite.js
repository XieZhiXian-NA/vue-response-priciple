const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const app = new Koa()
const compilerSfc = require('@vue/compiler-sfc')
const compilerDom = require('@vue/compiler-dom')
const { request } = require('http')

function rewriteImport(content){
    return content.replace(/from ['|"]([^'"]+)['|"]/g,(v,p1)=>{
            // . ../ /开头的都是相对路径
            if(p1[0]!=='.' && p1[0]!=='/') return `from '/@modules/${p1}'`
            else return v
        })
}

app.use(async ctx=>{
    const {url} = ctx.request
    const {request} = ctx
    if(url === '/'){
        ctx.type ='text/html'
        let content = fs.readFileSync('./index.html','utf-8')
        content = content.replace('<script ',`
        <script>
          window.process = {env:{ NODE_ENV:'dev'}}
        </script>
        <script 
      `)
      ctx.body = content

    }else if(url.endsWith('.js')){
        const p = path.resolve(__dirname,url.slice(1));
        ctx.type='application/javascript';
        const ret = fs.readFileSync(p,'utf-8')
        ctx.body = rewriteImport(ret)
    }else if(url.startsWith('/@modules/')){
        // 去node_module中查找 vue
        const prefix = path.resolve(__dirname,'node_modules',url.replace('/@modules/',''))
        const module = require(prefix+'/package.json').module
        const p = path.resolve(prefix,module)
        ctx.type='application/javascript';
        const ret = fs.readFileSync(p,'utf-8')
        ctx.body = rewriteImport(ret)
    }else if(url.indexOf('.vue')>-1){
        const p = path.resolve(__dirname,url.split('?')[0].slice(1))
       
        //  借助vue自己的compile框架，解析单文件组件，其实相当于vue-loader做的事情
        //  @vue/compiler-sfc 解析单文件组件
        //  @vue/compiler-dom 解析template 
        const {descriptor} = compilerSfc.parse(fs.readFileSync(p,'utf-8'))
        if(!request.query.type){
             // 一个组件 
             ctx.type='application/javascript'
             ctx.body = 
            `const __script = ${descriptor.script.content.replace('export default','').replace(/\n/g,'')}
             import {render as __render} from "${url}?type=template"
            __script.render = __render
            export default __script`
        }else if(request.query.type == 'template'){
            ctx.type='application/javascript'
            const template = descriptor.template
            // server端做compiler
            const render = compilerDom.compile(template.content,{mode:'module'}).code
            ctx.body = rewriteImport(render)
        }

    }else if(url.endsWith('.css')){
        const p = path.resolve(__dirname,url.slice(1))
        console.log(p)
        const file = fs.readFileSync(p,'utf-8')
        console.log(file)
        const content = `const css = "${file.replace(/\n/g,'')}"
         let link = document.createElement('style')
         link.setAttribute('type','text/css')
         document.head.appendChild(link)
         link.innerHTML = css
         export default css
        `
        ctx.type = "application/javascript"
        ctx.body = content
    }

})


//首页用到啥 就import啥 webpack是全量的引入 在开发模式下
app.listen(5000,()=>{
    console.log('服务器启动在5000')
})