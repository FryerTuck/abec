



// defn :: (dom-crud) : CRUD for the DOM .. runs clientSide
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        hard(function create(obj)
        {
            if(isWord(obj)){return document.createElement(obj)}; // done .. only text given as tag-name
            if(!expect.knob(obj,1)){return}; // validation
            let tmp,tag,def,ext,kds,rsl,chr; tmp=keys(obj); tag=tmp[0]; def=obj[tag]; delete obj[tag]; // tag-name
            chr=(!isText(def,2)?"":def.slice(0,1));
            if(!chr||(chr&&(!isin("#.",chr)||!test(def.slice(1,2),/[a-zA-Z]/)))){kds=def; def=VOID}; // quick-atr, or children
            ext=isin(tmp,["$","children","contents"]); if(ext){kds=obj[ext]; delete obj[ext]}; // contents
            rsl=document.createElement(tag); if(!def&&!kds&&(span(obj)<1)){return rsl}; // done .. no attributes nor contents
            obj=qatr(def,obj); rsl.modify(obj); if(kds){rsl.insert(kds)};
            return rsl;
        });


        hard(function select(def)
        {
            return document.documentElement.select(def);
        });


        hard(function remove()
        {
            return document.documentElement.remove.apply(document.documentElement,args(arguments));
        });

        extend(Element.prototype)
        ({
            lookup:function(c,n, r,w,s,d)
            {
                if(c=="^"){return this.parentNode}; if(c=="^^"){c="^",n=2}; d=["^","<",">"];
                if(c=="<"){return this.previousSibling}; if(c==">"){return this.nextSibling}; if(!isText(c,1)){return};
                if((c=="<<")||(c==">>")){r=this.parentNode; return (!r?VOID:((c=="<<")?r.firstElementChild:r.lastElementChild))};
                if(!isin(d,c)||!isInum(n)||(n<1)){return this}; s=rpart(c,d); if(s&&!isNaN(s[2])){n=s[2]}; n=(n*1);
                r=this; w=((c=="^")?"parentNode":((c=="<")?"previousSibling":"nextSibling"));
                while(n){n--; if(!!r[w]){r=r[w]}else{break}}; // find
                return r; // returns found-relative, or self if relative-not-found
            },

            select:function select(def)
            {
                if(!isText(def,1)){return}; let chr,qry,rsl,lst,tmp; chr=def.slice(0,1); qry="querySelectorAll"; rsl=[];
                if(isin("^<>",chr)){return this.lookup(def);}; // parents & siblings
                if(def=="*") // all children .. omit empty `#text` nodes
                {
                    listOf(this.childNodes).forEach((n)=>{if(((n.nodeName!="#text")||n.textContent.trim())){rsl.radd(n)}});
                    return rsl;
                };
                lst=this[qry](`:scope ${def}`);
                if((lst.length<1)&&(chr=="#")&&(def.indexOf(" ")<1)){def=def.slice(1); lst=this[qry](`:scope [name=${def}]`)};
                if(lst.length<1){return}; listOf(lst).forEach((n)=> // fixed querySelector bug
                {
                    if(isin(def,"[value=")){tmp=part(def,"=")[2]; tmp=unwrap(rpart(tmp,"]")[0]); if(n.value!=tmp){return}};
                    rsl.radd(n);
                });
                if(rsl.length<1){return}; if(chr=="#"){rsl=rsl[0]}; // implied
                return rsl;
            },

            modify:function modify(obj)
            {
                if(!isKnob(obj)){return this}; // validation

                obj.forEach((v,k)=>
                {
                    if((k=="style")&&isKnob(v)){this.setStyle(v); return};
                    if(!isFunc(v)&&!isKnob(v)&&(k!="innerHTML")){this.setAttribute(k,v);}; // normal attribute
                    if(k=="class"){k="className"}; // prep attribute names for JS
                    if(k!="style"){this[k]=v};
                    // set as property -which possibly triggers some DOM event - TODO :: check - it MAY FIRE TWICE!!
                });

                if(isText(obj.href,1))
                {this.enclan("link"); this.upon("click",function href(e){cancel(e); MAIN.location.href=this.href})};

                return this;
            },

            insert:function insert(v)
            {
                if(v==VOID){return this}; let t=nodeName(this);
                if(isList(v)){var s=this; listOf(v).forEach((o)=>{s.insert(o)});return s}; // works with nodelist also
                if(t=="img"){return this}; // TODO :: impose?
                if(t=="input"){this.value=text(v); return this}; // form input text
                if(isNode(v)||isTemp(v)){this.appendChild(v); return this}; // normal DOM-node append
                if(isKnob(v)){let n=create(v); if(!isNode(n)){return this}; this.appendChild(n);return this}; //create & append
                if(isText(v)&&(wrapOf(trim(v))=="<>")){this.innerHTML=v; return this}; // insert as html
                if(!isText(v)){v=text(v);}; // convert any non-text to text .. circular, boolean, number, function, etc.
                if(isin("code,text",t)){this.textContent=v; return this;}; // insert as TEXT
                if(isin("style,script,pre,span,h1,h2,h3,h4,h5,h6,p,a,i,b",t)){this.innerHTML=v; return this}; // insert as HTML
                let n=create("span"); n.innerHTML=v; this.appendChild(n); return this; // append text as span
            },

            remove:function remove()
            {
                let a=args(arguments); a.forEach((d)=>
                {
                    if(isText(d)){d=this.select(d);}; if(!isList(d)){d=[d]};
                    d.forEach((n)=>{if(!isNode(n)){return}; n.parentNode.removeChild(n)});
                });
                return this;
            },

            getStyle:function getStyle()
            {
                let n,a,r,s,t,y; n=this; if(!expect.live(n)){return}; a=args(arguments); r={};
                if((a.length<2)&&isin(a[0],",")){a=mean(a[0])}; s=getComputedStyle(n);
                a.forEach((p)=>{t=s.getPropertyValue(p); y=(rtrim(t,"px")*1); r[p]=(!isNaN(y)?y:t)});
                return ((span(r)<2)?vals(r)[0]:r);
            },

            setStyle:function setStyle(a)
            {
                a=decode.pty(a); if(!isKnob(a,1)){return};
                a.forEach((v,k)=>{if(isNumr(v)&&!isin("zIndex,opacity,fontWeight",k)){v+="px"}; this.style[k]=v});
                return this;
            },
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: (tools) : client-side
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        herald(document); herald(Element.prototype);


        extend(HTMLImageElement.prototype)
        ({
            toDataURL:function(m,q)
            {
                let c=document.createElement("canvas");
                c.width=this.naturalWidth; c.height=this.naturalHeight;
                c.getContext("2d").drawImage(this,0,0);
                c=c.toDataURL(m,q); return c;
            },
        });


        const copyToClipboard = str =>
        {
            let el=document.createElement("textarea"); el.value=str;
            el.setAttribute("readonly",""); el.style.position="absolute";
            el.style.left="-9999px"; BODY.appendChild(el); el.select();
            document.execCommand("copy"); BODY.removeChild(el);
        };
        bake(copyToClipboard);


        hard(function render(src,tgt,cbf)
        {
            if(isFunc(tgt)){cbf=tgt; tgt=VOID};
            if(!isNode(tgt)){tgt=BODY}; if(!isFunc(cbf)){cbf=function(){}}; tgt.innderHTML="";
            if(isPath(src)||isPurl(src))
            {
                let ext=fext(pathOf(src));
                if(!ext||!render.handle[ext]){fail(`missing handler for "${ext}" .. user render.modify()`); return};
                render.handle[ext](src,(rsl)=>{tgt.insert(rsl); cbf(rsl)});
                return;
            };
            // src=create({div:src}).select("*");  tgt.innderHTML=""; tgt.insert(src); cbf(src);
            tgt.innderHTML=""; tgt.insert(src); cbf(src);
        });

        extend(render)
        ({
            handle:
            {
                js:function js(src,cbf){cbf(create({script:"",src:src}));},
                css:function css(src,cbf){cbf(create({link:"",rel:"stylesheet",href:src}));},
                jpg:function jpg(src,cbf){cbf(create({img:"",src:src}));},
                png:function png(src,cbf){cbf(create({img:"",src:src}));},
                gif:function gif(src,cbf){cbf(create({img:"",src:src}));},
                txt:function txt(src,cbf){disk.readFile(src,(rsp)=>{cbf(create({pre:rsp}))});},
                htm:function htm(src,cbf){disk.readFile(src,(rsp)=>{cbf(create({div:rsp}).select("*"))});},
                html:function html(src,cbf){render.handle.htm(src,cbf);},
                jpeg:function jpeg(src,cbf){cbf(create({img:"",src:src}));},
                webp:function webp(src,cbf){cbf(create({img:"",src:src}));},
                json:function json(src,cbf){disk.readFile(src,(rsp)=>{cbf(decode.jso(rsp))});},
            },
            modify:function modify(obj)
            {
                extend(this.handle)(obj);
            },
        });

        extend(Element.prototype)
        ({
            render:function render(def,cbf)
            {
                MAIN.render(def,this,cbf);
            },
        });


        hard(function rect(a)
        {
            if(isText(a)){a=select(a)}; if(!isNode(a)){fail("reference :: expecting node or #nodeID");return};
            if(!a.parentNode){fail("lookup :: node is not attached to the DOM .. yet");return};
            let r=decode.jso(encode.jso(a.getBoundingClientRect())); r.forEach((v,k)=>{r[k]=Math.round(v)});
            return r;
        });


        hard(function styleSheet(d)
        {
          let r,z,l; r=VOID; z={}; if(!isText(d,1)){return};
          l=listOf(document.styleSheets); if(d==="*"){return l}; l.forEach((v)=>
          {if(isin(v.ownerNode.href,d)||(v.ownerNode.id==d)||isin(v.className,d)){r=listOf(v.rules); return STOP}});
          (r||{}).forEach((i)=>
          {
             let s=i.selectorText; let p={}; if(!s||!isin(i.cssText,';')){return};
             let q=trim(unwrap(trim(i.cssText.split(s)[1]))).split(';'); q.forEach((y)=>{y=part(y,':'); if(!y){return};
             let k=trim(y[0]); let v=trim(y[2]); if(isNumr(v)){v*=1}else{v=unwrap(v)}; p[k]=v}); z[s]=p;
          });
          return z;
        });

    };
// ----------------------------------------------------------------------------------------------------------------------------







// func :: ordain : creates a named template, used as CSS-class-name for attribute enheritance, including events
// ----------------------------------------------------------------------------------------------------------------------------
    extend(MAIN)
    ({
        ordain:function ordain(nme,obj)
        {
            if(!expect.word(nme)){return}; if(!!this.done[nme]){return TRUE};
            if(!!select(`#${nme}`)){fail(`a node with ID "${nme}" already exists`); return};

            let wth = function(a)
            {
                let k,n,t; n=this.n;
                if(isKnob(a,1))
                {
                    if(isKnob(a.style)){a.style=decode.pty(a.style)};
                    this.s.done[n]=a;
                }
                else if(isText(a,1))
                {
                    if(!isin(a,"{")){a=decode.b64(a)}; t=create({style:("#"+n),$:a});
                    this.s.done[n]=t; HEAD.insert(t);
                    this.s.call();
                };
            }
            .bind({n:nme,s:this});

            return (!isVoid(obj)?wth(obj):enwith(wth));
        }
        .bind
        ({
            done: {},
            call: function call(w)
            {
                ((isText(w,1)&&!!this.done[w])?[w]:keys(this.done)).forEach((c)=>
                {
                    let v=copyOf(this.done[c]); if(isText(v)){return}; // clobal CSS class
                    (select("."+c)||[]).forEach((n)=>{if(n.ordained==c){return}; n.ordained=c; n.modify(v);});
                });
            },
        })
    });


    hard(function ornate(nme,css)
    {
        let wth = function(txt){if(isKnob(txt)){txt=encode.css(txt)}; return ordain(nme,txt)};
        return (!isVoid(css)?wth(css):enwith(wth));
    });


    hard(function cssGrp(c,l,o)
    {
        if(!expect.text(c,1)){return}; let q=0; if(isKnob(l)){o=l; l=[0]; q=1}; if(isVoid(l)){l=[0]; q=1};
        if(!expect.list(l)){return}; let r,s,z,d; r=""; s=l.length; z=l.item(-1); d={}; l.forEach((i)=>
        {
            let x=(q?"":i.padd(s)); if(isText(o)&&isin(o,"?")){r+=(c+x+" {"+o.swap("?",i)+"}\n"); return};
            if(isKnob(o)){o.forEach((v,k)=>{r+=(c+k+x+" {"+text(v).swap("?",i)+"}\n")}); return};
            if(isFunc(o))
            {
                let t; t=o.apply(l,[i,z]); if(!isKnob(t,1)){return};
                t.forEach((v,k)=>{if(d[(c+k)]){return}; d[(c+k)]=1; r+=(c+k+" {"+v+"}\n")}); return;
            };
        });
        return r;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: (Element.prototype) : enclan/declan .. add/remove classNames of an element
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
       extend(Element.prototype)
       ({
          enclan:function()
          {
             let c,l,a,slf; slf=this; c=(slf.className||'').trim(); l=(c?c.split(' '):[]); a=args(arguments);
             a.forEach((v,k)=>{v=ltrim(v,'.'); if(!isin(l,v)){l.push(v);}});
             this.className=l.join(' ').trim();
          },


          declan:function()
          {
             var c,l,a,x; c=(this.className||'').trim(); l=(c?c.split(' '):[]); a=listOf(arguments);
             a.forEach((i)=>{x=l.indexOf(ltrim(i,'.')); if(x>-1){l.splice(x,1)}}); this.className=l.join(' ').trim();
          },


          reclan:function()
          {
             var a; a=listOf(arguments); a.forEach((i)=>
             {
                if(!isText(i)||!isin(i,':')){return}; let p=i.split(':'); let f=p[0].trim(); let t=p[1].trim();
                if(!f||!t){return}; this.declan(f); this.enclan(t);
             });
          },


          inclan:function()
          {
             var a,c,r; a=listOf(arguments); c=(this.className||'').trim(); r=FALS;
             a.forEach((i)=>{i=ltrim(i,'.'); if(isin(c),i){r=TRUE;return STOP}});
             return r;
          },


          enbool:function(w)
          {
             if(!isText(w,1)){return}; this[w]=true; this.setAttribute(w,w); this.enclan(w);
          },


          debool:function(w)
          {
             if(!isText(w,1)){return}; this[w]=false; this.removeAttribute(w); this.declan(w);
          },
       });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: (Element.prototype) : assort .. sort node placement order either by `sorted` (arg/parent), or `placed` of siblings
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
       extend(Element.prototype)
       ({
          assort:function(r, f,w)
          {
             if(!r){r=this.sorted}; w=`assort rule: ${r}`; f=`invalid ${w}`;  let prts,slct,attr,ordr,indx,fltr;
             if(!isText(r,6)||!isin(r,"::")){fail(f);return}; prts=part(r,"::"); slct=trim(prts[0]);
             prts=part(trim(prts[2]),":"); if(!slct||!prts){return}; attr=trim(prts[0]); ordr=lowerCase(trim(prts[2]));
             if(!attr||!ordr){return}; slct=this.select(slct); if(!slct){return}; indx={};
             slct.forEach((n)=>{let a=bore(n,attr); if(isVoid(a)){return}; indx[a]=n; remove(n)});
             fltr=(keys(indx)).sort(); if(ordr=="dsc"){fltr.reverse()}; fltr.forEach((i)=>{this.appendChild(indx[i])});
          },
       });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// sham :: Cookies : cookie handler .. https://github.com/js-cookie/js-cookie
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        !function(e){var n=!1;if("function"==typeof define&&define.amd&&(define(e),n=!0),"object"==typeof exports&&(module.exports=e(),n=!0),!n){var o=window.Cookies,t=window.Cookies=e();t.noConflict=function(){return window.Cookies=o,t}}}(function(){function g(){for(var e=0,n={};e<arguments.length;e++){var o=arguments[e];for(var t in o)n[t]=o[t]}return n}return function e(l){function C(e,n,o){var t;if("undefined"!=typeof document){if(1<arguments.length){if("number"==typeof(o=g({path:"/"},C.defaults,o)).expires){var r=new Date;r.setMilliseconds(r.getMilliseconds()+864e5*o.expires),o.expires=r}o.expires=o.expires?o.expires.toUTCString():"";try{t=JSON.stringify(n),/^[\{\[]/.test(t)&&(n=t)}catch(e){}n=l.write?l.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=(e=(e=encodeURIComponent(String(e))).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent)).replace(/[\(\)]/g,escape);var i="";for(var c in o)o[c]&&(i+="; "+c,!0!==o[c]&&(i+="="+o[c]));return document.cookie=e+"="+n+i}e||(t={});for(var a=document.cookie?document.cookie.split("; "):[],s=/(%[0-9A-Z]{2})+/g,f=0;f<a.length;f++){var p=a[f].split("="),d=p.slice(1).join("=");this.json||'"'!==d.charAt(0)||(d=d.slice(1,-1));try{var u=p[0].replace(s,decodeURIComponent);if(d=l.read?l.read(d,u):l(d,u)||d.replace(s,decodeURIComponent),this.json)try{d=JSON.parse(d)}catch(e){}if(e===u){t=d;break}e||(t[u]=d)}catch(e){}}return t}}return(C.set=C).get=function(e){return C.call(C,e)},C.getJSON=function(){return C.apply({json:!0},[].slice.call(arguments))},C.defaults={},C.remove=function(e,n){C(e,"",g(n,{expires:-1}))},C.withConverter=e,C}(function(){})});
        Cookies.defaults.path='/';
        // Cookies.defaults.domain=HOSTNAME;

        Http.request.assign({apikey:Cookies.get("apikey")}); Cookies.remove("apikey"); // for security
    };
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: renderer : 3d helper tool
// ----------------------------------------------------------------------------------------------------------------------------
    class renderer
    {
        constructor(tgt)
        {
            if(!runsAt(CLIENT)){return};
            let tmp; this.assign({loaded:{OBJLoader:THREE.OBJLoader},halted:TRUE,driver:{},recent:{}});

            if(isKnob(tgt)&&!isNode(tgt)){tgt=create("div").modify(tgt)}
            else if(isText(tgt))
            {
                tgt=trim(tgt); if(!expect.text(tgt,1)){return}; try{tmp=select(tgt);}catch(e){};
                if(isNode(tmp)){tgt=tmp}else if(isList(tmp,1)){tgt=tmp[0]}
                else if(isWord(tgt)){tgt=create(tgt)}else{tgt=create({div:tgt})};
            };

            if(!expect.node(tgt)){return}; this.holder=tgt; herald(this); // must be DOM node

            when(()=>{return ((this.holder.select("^")&&!this.recent.busy)?this.holder:VOID)}).
            then((nde)=>
            {
                let box=rect(nde.parentNode); let opt; // options may be optional later
                let req={angle:45,ratio:(box.width/box.height),place:15000,speed:0.3};
                if(!isKnob(opt)){opt=req}else{opt.assign(req)};

                this.driver.scene = new THREE.Scene();
                this.driver.webgl = new THREE.WebGLRenderer();
                this.driver.camra = new THREE.PerspectiveCamera(opt.angle,opt.ratio,1,opt.place);
                this.driver.rayca = new THREE.Raycaster();
                this.driver.mouse = new THREE.Vector2();
                this.driver.cntrl = new THREE.OrbitControls(this.driver.camra,this.driver.webgl.domElement);

                this.driver.cntrl.zoomSpeed = opt.speed;
                this.driver.cntrl.target = (new THREE.Vector3(0,0,0));
                this.driver.camra.position.z = 1000;
                this.driver.webgl.setPixelRatio(window.devicePixelRatio);
                this.driver.webgl.setSize(box.width, box.height);

                nde.appendChild(this.driver.webgl.domElement);


                this.driver.cntrl.addEventListener("change",(e)=>
                {
                    if(!this.isLive()){return}; // nothing to do .. prevents errors
                    if(this.recent.ctrl){this.recent.ctrl=0; return}; // this was us .. below

                    let num,bfr,pos,rot,dir; num=(this.recent.numr||0); num++; bfr=(this.recent.bufr||[]);

                    pos=round(vals(e.target.object.position).lpop(!0),12);
                    rot=round(vals(e.target.object.rotation).lpop(!0).rpop(!0).rpop(!0),12);
                    bfr.radd({pos:pos,rot:rot}); if(bfr.length>3){bfr.lpop()}; this.recent.bufr=bfr;

                    if(bfr.length<3){this.render(1); return}; // wait for 3 objects
                    if(bfr.select({fetch:"rot",where:UNIQUE}).length == 1)
                    {
                        if((bfr[0].pos[2]<bfr[1].pos[2])&&(bfr[1].pos[2]<bfr[2].pos[2])){dir="Bck"}
                        else if((bfr[0].pos[2]>bfr[1].pos[2])&&(bfr[1].pos[2]>bfr[2].pos[2])){dir="Fwd"};
                        if(dir){this.emit("CameraDolly",{direct:dir,buffer:bfr});};
                    }
                    else if(!dir)
                    {this.emit("CameraRotate",{buffer:bfr});};

                    this.render(EXCEPT);
                });


                this.upon("CameraDolly",(e)=>
                {
                    let dir,bfr,dif,rot; dir=e.detail.direct; bfr=e.detail.buffer; dif=500;
                    if((dir=="Fwd")&&((bfr[0].pos[2]-bfr[2].pos[2]) > dif)){return};
                    if((dir=="Bck")&&((bfr[2].pos[2]-bfr[0].pos[2]) > dif)){return}; rot=this.driver.camra.rotation;
                    this.driver.cntrl.target=(new THREE.Vector3(bfr[0].pos[0], bfr[0].pos[1], (bfr[0].pos[2]-dif)));
                    this.driver.cntrl.update();
                    this.driver.camra.setRotationFromEuler(rot);
                });


                upon("ResizeEnd",()=>{this.resync()});

                this.halted=FALS; this.resync(); this.render();
                this.holder.renderer=this;
                this.emit("ready");
            });

            after(3000)(()=>{if(!this.isLive()){moan("the holder is expected inside the DOM by now")}});
            return this;
        }


        deploy(tgt)
        {
            if(!expect.node(tgt)){return};
            if(!tgt.select("^")){fail("deploy target must exist inside the DOM"); return};
            tgt.appendChild(this.holder);
            return this;
        }


        obtain(obj,dmp)
        {
            if(isPath(obj)){obj={[(leaf(obj).split(".")[0])]:obj}};
            if(!expect.knob(obj,1)){return}; this.recent.busy=1;
            var d,m; d=[0,span(obj)]; m={}; obj.forEach((v,k)=>
            {
                if(!expect.path(v)){return}; let mod,ext; mod=leaf(v).split(".")[0]; ext=fext(v);
                if(isin(this.loaded,mod)){d[0]++; return NEXT};

                if(isin("jpg,jpeg,png,gif,webp,svg,bmp",ext))
                {
                    this.loaded[k]=new THREE.TextureLoader().load(v,()=>{d[0]++});
                    return NEXT;
                };

                if(isin("js,jsm",ext))
                {
                    disk.readFile(v,(txt,hdr,obj)=>
                    {
                        let frg; frg=`var ${mod} = (`; mod=leaf(obj.path).split(".")[0];
                        let vrs,arg; vrs = expose(txt,"import {","} from "); txt=trim(txt);
                        if(!isin(txt,frg)){moan(`expecting \`${frg}\``); d[1]--; return};
                        if(!vrs){moan(`expecting import vars`); d[1]--; return};

                        arg=swap(vrs[0].trim(),["\n","\t"," "],"").split(",");
                        vrs=arg.modify((i)=>{return (i+" = THREE."+i)});
                        arg=arg.join(","); vrs=(vrs.join(";\n")+";\n");
                        txt=txt.split(frg).pop(); txt=txt.split("\n").rpop(TRUE).join("\n");
                        txt=(`!(function(${arg})\n{\n${vrs}\n${frg+txt}\n\nTHREE.${mod}=${mod}; return ${mod};\n}());`);

                        if(dmp==DUMP){dump(btoa(txt))}; HEAD.insert({script:`#THREE_${mod}`,$:txt});
                        this.loaded[mod]=THREE[mod]; m[mod]=THREE[mod]; d[0]++;
                    });
                    return NEXT;
                };

                if(isin("obj",ext))
                {
                    // let man = new THREE.LoadingManager();
                    let ldr = new this.loaded.OBJLoader(); ldr.load(v,(o)=>
                    {
                        (function(s){s.loaded[this.mod]=o; m[this.mod]=o; d[0]++;}.bind({mod:mod})).apply(null,[this]);
                    });
                };
            });

            when(()=>{return (d[0]>=d[1])}).then(()=>{this.recent.busy=0; this.emit("loaded",this.loaded)});

            enthen(this,function(cbf){when(()=>{return (d[0]>=d[1])}).then(()=>
            {this.recent.busy=0; cbf.apply(this,[((span(m)<2)?vals(m)[0]:m)])})});
            // this.then.done=m;
            return this;
        }


        vivify()
        {
            this.halted=FALS; if(!this.isLive()){moan(`the holder is expected inside the DOM`); this.halted=TRUE; return};
            this.resync(); return this;
        }


        pacify()
        {
            this.halted=TRUE;
            return this;
        }


        isLive()
        {
            return (MAIN.HALT||this.halted||(!isNode(this.holder)||!this.holder.select("^"))?FALS:TRUE);
        }


        resync()
        {
            if(!this.isLive()){return}; let box=rect(this.holder.parentNode);
            this.driver.camra.aspect = (box.width/box.height);
            this.driver.camra.updateProjectionMatrix(); this.driver.webgl.setSize(box.width,box.height);
            this.render(); this.emit("resync"); return this;
        }


        render(ctrl)
        {
            if(!this.isLive()){return};
            this.driver.mouse.x = ((device.vars.axis.x/window.innerWidth) * 2 - 1);
            this.driver.mouse.y = ((device.vars.axis.y/window.innerHeight) * 2 + 1);

            this.driver.rayca.setFromCamera(this.driver.mouse,this.driver.camra);
            if(ctrl!==EXCEPT){this.driver.cntrl.update()}; this.emit("beforeRender");
            this.driver.webgl.render(this.driver.scene,this.driver.camra);
        }


        create(arg)
        {
            if(!expect.knob(arg,1)){return}; let nme,fnc,qck,kds,atr; nme=keys(arg)[0]; fnc=this.skills[nme];
            if(!isFunc(fnc)){moan(`no skill available to create "${nme}"`); return this}; qck=arg[nme]; delete arg[nme];
            kds=(arg.$||arg.children||arg.contents); delete arg.$; delete arg.children; delete arg.contents;
            if(!isList(kds)){kds=[]};
            return fnc.apply(this,[qatr(qck),arg,kds]); // extended skills
        }


        select(arg)
        {
            if(isText(arg,2)&&arg.startsWith("#"))
            {
                return this.driver.scene.getObjectByName(arg.slice(1));
            };
        }


        insert(arg)
        {
            if(isPath(arg))
            {
                this.obtain(arg).then((m)=>{this.driver.scene.add(m)});
                return this;
            };

            return this;
        }


        remove(arg,vac)
        {
            let tgt=this.select(arg); if(!tgt){return this}; if(!isList(tgt)){tgt=[tgt]};
            tgt.forEach((i)=>{if(vac){i.material.dispose(); i.geometry.dispose()}; i.remove()});
            this.render();
            return this;
        }
    }
// ----------------------------------------------------------------------------------------------------------------------------




// xtnd :: (renderer.create) : dots
// ----------------------------------------------------------------------------------------------------------------------------
    extend(renderer.prototype).with
    ({
        skills:
        {
            dots:function dots(atr,opt,kds)
            {
                let rsl = //object
                {
                    source: this,
                    points: [],
                    recent: {busy:null,done:{}},
                    insert: function insert(itm)
                    {
                        cancel(this.recent.busy); let win,len,hsh,vrt,far,lst;
                        hsh=hash(itm); if(this.recent.done[hsh]){return};
                        this.recent.done[hsh]=itm; this.points.radd(itm); this.recent.busy=tick.after(50,()=>
                        {
                            win=[window.innerWidth,window.innerHeight]; this.points=this.points.select({order:"xyz.2:DSC"});
                            lst=this.points; len=lst.length; far=lst.item(-1).xyz[2];

                            if(!this.geomet)
                            {
                                opt = ({size:35,sizeAttenuation:true,alphaTest:0.4,transparent:true}).assign(opt); let a,x,y,z;
                                this.geomet=(new THREE.BufferGeometry()); this.materi=(new THREE.PointsMaterial(opt)); vrt=[];

                                lst.forEach((obj)=>
                                {
                                    a=obj.xyz; x=a[0]; y=a[1]; z=((a[2]-far)/(1-far)); x-=0.5; y-=0.5; z-=0.5;
                                    x*=win[0]; y*=win[1]; z*=len; vrt.push(x,y,z);
                                });

                                this.geomet.setAttribute("position",(new THREE.Float32BufferAttribute(vrt,3)));
                                this.partic = (new THREE.Points(this.geomet,this.materi));
                                this.source.driver.scene.add(this.partic);
                                this.recent = {over:VOID};
                                this.source.listen("beforeRender",()=>
                                {
                                    let hvr,idx; hvr=this.source.driver.rayca.intersectObject(this.partic);

                                    if(hvr.length<1)
                                    {
                                        if(this.recent.over!==VOID)
                                        {this.source.signal("mouseout",this); this.recent.over=VOID};
                                        return;
                                    };

                                    idx=hvr[0].index; this.recent.over=idx;
                                    this.source.signal("mouseover",this);
                                });


                            };

                            this.source.render();
                        })
                    },
                    remove: function remove(itm)
                    {

                    },
                };

                return rsl;
            },
        }
    })
// ----------------------------------------------------------------------------------------------------------------------------




// shim :: (Element.prototype.init3D) : 3d helper tool to bind it to an HTML node
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        extend(Element.prototype)
        ({
            init3D:function init3D(arg)
            {
                return (new renderer(arg)).deploy(this);
            }
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// evnt :: device : events
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        extend(MAIN)
        ({
            device:
            {
                vars:
                {
                    axis:{x:0,y:0}, btns:{}, busy:{}, last:{},
                },
                keyCombo:"",
                getCombo:function getCombo(how, ae)
                {
                    this.keyCombo=keys(this.vars.btns).join(" ").trim();
                    if((how!=SILENT)&&isin(this.keyCombo," "))
                    {
                        emit("KeyCombo",this.keyCombo); emit(this.keyCombo);
                        ae=vars("View/focusObj/crnt"); if(!!ae){ae.emit(this.keyCombo)};
                    };
                    return this.keyCombo;
                },
            },
        });

        MAIN.upon("mousemove",function(e)
        {
            let na,oa,en,be,ae; be="MouseMove"; oa=device.vars.axis; na={x:e.clientX,y:e.clientY};
            ae=vars("View/focusObj/crnt"); emit((be+"Any"),na); if(!!ae){ae.emit((be+"Any"),na)};
            en=((na.x>oa.x)?"Rigt":((na.x<oa.x)?"Left":((na.y>oa.y)?"Down":((na.y<oa.y)?"Up":""))));
            if(!en){return}; en=(be+en); device.vars.axis=na; emit(en,na); if(!!ae){ae.emit(en,na)};
            device.vars.last="mouse"; if(device.vars.busy.mouse)
            {clearTimeout(device.vars.busy.mouse)}else{emit((be+"Begin"),na); if(!!ae){ae.emit((be+"Begin"),na)};};
            device.vars.busy.mouse=tick.after(300,()=>
            {
                delete device.vars.busy.mouse; delete device.vars.btns[en];
                emit((be+"End"),na); if(!!ae){ae.emit((be+"End"),na)};
            });
        });

        MAIN.upon("wheel",function(me)
        {
            let x=(Math.round(me.deltaX)||0); let y=(Math.round(me.deltaY)||0); let ae,ew,sw,sl,bx,xr,xd,xp,a;
            let d; if(!x){x=0;}; if(!y){y=0;}; if(me.deltaMode==1){x*=12; y*=12}; let eh,sh,st,el,yr,yd,yp,p;
            el=me.target; bx=rect(el); ew=bx.width; eh=bx.height; sw=el.scrollWidth; sh=el.scrollHeight;
            d=((sw>ew)?((x>0)?R:((x<0)?L:M)):((sh>eh)?((y>0)?D:((y<0)?U:M)):M)); let z;
            a=((d==M)?M:(((d==L)||(d==R))?X:Y)); sl=el.scrollLeft; st=el.scrollTop;
            p=round(((a==X)?((sl+ew)/sw):((st+eh)/sh)),1); ae=vars("View/focusObj/crnt");
            z=round((a==M)?0:((a==X)?(sw-(sl+ew)):(sh-(st+eh)))); let crd=[x,y,d,a,p,z];

            emit("MouseWheel",crd); if(!!ae){ae.emit("MouseWheel",crd)};
            if(device.vars.busy.wheel){clearTimeout(device.vars.busy.wheel);}
            else{emit("WheelBegin",crd); if(!!ae){ae.emit("WheelBegin",crd)};};
            device.vars.busy.wheel=tick.after(300,()=>
            {delete device.vars.busy.wheel; emit("WheelEnd",crd); if(!!ae){ae.emit("WheelEnd",crd)};});
        });

        MAIN.upon("mousedown",function(e)
        {
            let cb,en,ae; cb=((e.which<2)?"Left":((e.which==2)?"Middle":"Right")); device.vars.last="mouse";
            en=(cb+"Click"); device.vars.btns[en]=1; device.getCombo(); emit(en);
            ae=vars("View/focusObj/crnt"); if(!!ae){ae.emit(en,cb)};
            let tap=(device.vars.taps||0); tap++;
            if((cb!="Left")||(tap<2)){emit(en); return}; device.vars.taps=tap;
            if(device.vars.busy.tap){clearTimeout(device.vars.busy.tap)};
            device.vars.busy.tap=tick.after(120,()=>
            {delete device.vars.busy.tap; delete device.vars.taps; emit("tap"+tap);});

        });

        MAIN.upon("mouseup",function(e)
        {
            let cb,en,ae; cb=((e.which<2)?"Left":((e.which==2)?"Middle":"Right")); device.vars.last="mouse";
            en=("MouseUp"+cb); delete device.vars.btns[(cb+"Click")]; device.getCombo(SILENT); emit(en);
            ae=vars("View/focusObj/crnt"); if(!!ae){ae.emit(en,cb)};
        });

        MAIN.upon("keydown",function(e)
        {
            let cb,ae; cb=e.key; if(e.keyCode==91){cb="Meta";}else if(cb==" "){cb="Space"}; device.vars.last="keyboard";
            device.vars.btns[cb]=1; device.getCombo(); emit("KeyDown",cb);
            ae=vars("View/focusObj/crnt"); if(!!ae){ae.emit("KeyDown",cb)};
        });

        MAIN.upon("keyup",function(e)
        {
            let cb,ae; cb=e.key; if(e.keyCode==91){cb="Meta";}else if(cb==" "){cb="Space"}; device.vars.last="keyboard";
            delete device.vars.btns[cb]; device.getCombo(); emit("KeyUp",cb);
            ae=vars("View/focusObj/crnt"); if(!!ae){ae.emit("KeyUp",cb)};
        });

        MAIN.upon("keypress",function(e)
        {
            let cb,ae; cb=e.key; ae=vars("View/focusObj/crnt");
            if(e.keyCode==91){cb="Meta";}else if(cb==" "){cb="Space"}; emit("KeyPress",cb); if(!!ae){ae.emit("KeyPress",cb)};
            device.vars.last="keyboard"; if(e.repeat){emit("KeyRepeat",cb); if(!!ae){ae.emit("KeyRepeat",cb)};};
            if(device.vars.busy.keyboard){clearTimeout(device.vars.busy.keyboard)}
            else{emit("TypingBegin",cb); if(!!ae){ae.emit("TypingBegin",cb)};};
            device.vars.busy.keyboard=tick.after(300,()=>
            {delete device.vars.busy.keyboard; emit("TypingEnd",cb); if(!!ae){ae.emit("TypingEnd",cb)};});
        });

        MAIN.upon("contextmenu",function(e)
        {
            if(device.vars.last=="mouse"){e.preventDefault(); return false;};
        });

        MAIN.upon("resize",function(e)
        {
            if(device.vars.busy.resize){clearTimeout(device.vars.busy.resize)}else{emit("ResizeBegin")};
            device.vars.busy.resize=tick.after(300,()=>{delete device.vars.busy.resize; emit("ResizeEnd")});
        });

        MAIN.upon("blur",function(e)
        {
            device.vars.btns={};
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------







// evnt :: device : events
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        tick.every(50,function domClock(elem,prev,crnt,fobj)
        {
            elem = document.activeElement;
            prev = vars("View/focusObj/prev");
            crnt = vars("View/focusObj/crnt");

            signal("tick");

            if(!elem && !crnt){return}; // is nothing and was nothing
            if(!!elem && !elem.uuid){extend(elem)({uuid:hash(md5)})}; // needed for comparison below
            if((!!elem && !!crnt) && (elem.uuid===crnt.uuid)){return}; // same element is still focussed

            if(!elem && !!crnt) // is nothing and was something .. lost focus
            {
                vars({View:{focusObj:{prev:crnt,crnt:VOID}}});
                signal("focuschange",vars("View/focusObj")); return;
            };

            if(!!elem) // is something and is not the same as last .. changed focus
            {
                vars({View:{focusObj:{prev:crnt,crnt:elem}}});
                signal("focuschange",vars("View/focusObj")); return;
            };
        });


        upon("load",function prep()
        {
            if(seen("HEAD")){return}; // window.onload was triggered before
            defn({HEAD:document.head, BODY:document.body}); // global shorthands

            defn({HOSTNAME:(function()
            {
                if(ENVITYPE=="web"){return location.hostname};
                return ":webext:";
            }())});

            defn({HOSTPURL:(function()
            {
                if(ENVITYPE=="web"){return (PROTOCOL+"://"+HOSTNAME)};
                return "webext";
            }())});

            after(10)(()=>{emit("almostReady").then(()=>
            {
                vars({config:copyOf(config)});
                BODY.enclan(conf("View/cssTheme"));
                emit("configReady").then(()=>
                {
                    loadFont(conf("View/iconFont"),"icon",{},()=>
                    {
                        emit("allReady");
                    });
                });
            })});
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// func :: parlay : modal basis .. creates a user-negotiations layer that disables anything under it .. closes with ESC-key
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        hard(function parlay(dfn)
        {
            let lay=create({view:`.parlay .bgtint`, tabindex:-1, $:dfn});
            lay.listen("KeyDown",function(btn){dump(btn)});
            BODY.insert(lay); after(10)(()=>{lay.focus()});
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// func :: popwin : client-side .. modals
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        hard(function popwin()
        {

        });
    };
// ----------------------------------------------------------------------------------------------------------------------------
