"use strict";


// defn :: (main constants) : useful for if another script overwrites something
// ----------------------------------------------------------------------------------------------------------------------------
    const MAIN = globalThis; // context
    const VOID = (function(){}()); // undefined
    const NULL = null; // syntax sugar
    const TRUE = (!0);
    const FALS = (!1);
// ----------------------------------------------------------------------------------------------------------------------------




// func :: bake : define immutable property .. shorhand for Object.defineProperty and all required constituents
// ----------------------------------------------------------------------------------------------------------------------------
    const bake = function bake(p,v,x,s)
    {
        if(((typeof p)==="function")&&(v===VOID)){if(!p.name){return}; v=p; p=v.name}; // named function
        if(!x){x=MAIN}; // if no context is given then MAIN is assumed
        if(((typeof p)!="string")){return}; if(!x.hasOwnProperty){return}; // validation
        if(v===VOID){v=x[p]; if(v===VOID){return}}; // value is already in context, or undefined
        if(s){Object.defineProperty(x,p,{value:v})} // soft .. not bake -but saves duplication
        else{Object.defineProperty(x,p,{writable:false,enumerable:false,configurable:false,value:v})}; // harden, or fail
        return v; // all is well
    };

    bake(bake); // harden unbaked
    bake("MAIN",MAIN); bake("VOID",VOID); bake("NULL",NULL); bake("TRUE",TRUE); bake("FALS",FALS);
// ----------------------------------------------------------------------------------------------------------------------------




// func :: hard/soft : define something in another context (e.g global) -from within any other context .. immutable -or mutable
// ----------------------------------------------------------------------------------------------------------------------------
    bake(function hard(p,v,x){return bake(p,v,x)});   // syntax sugar for bake hard .. immutable
    bake(function soft(p,v,x){return bake(p,v,x,1)}); // syntax sugar for bake soft .. mutable
// ----------------------------------------------------------------------------------------------------------------------------




// func :: defn : define immutable globals .. syntax sugar .. returns true if all went well
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function defn(o)
    {
        let t,f; t=(typeof o); f=0; // t:type .. f:fail

        if(t=="string")
        {
            let l=o.trim(); if(!l){return}; // validation
            l.split(" ").forEach((i)=>{i=i.trim(); if(!i){f++;return}; bake(i,`:${i}:`)});
            return (f?(!1):(!0)); // if all defined then return true, else false
        };

        if(t=="object")
        {
            if(Object.keys(o).length<1){return}; // validation
            for(let k in o)
            {
                if(((typeof k)!="string")||(k.length<1)||!o.hasOwnProperty(k)){f++;continue}; // validation
                bake(k,o[k]);
            };
            return (f?(!1):(!0)); // if all defined then return true, else false
        };

        // .. or return undefined
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: (dump/moan) : console.log & console.error shorthands
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function dump(){console.log.apply(console,([].slice.call(arguments)))});
    hard(function moan(m)
    {let a=([].slice.call(arguments)); a.unshift("\x1b[31m%s\x1b[0m"); console.error.apply(console,a);});
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: (flags) : to use everywhere .. mostly for shorthand, flags, syntax-sugar
// ----------------------------------------------------------------------------------------------------------------------------
    defn("A B C D E F G H I J K L M N O P Q R S T U V W X Y Z");
    defn("OK NA TL TM TR RT RM RB BR BM BL LB LM LT MM");
    defn("ANY ALL");
    defn("INIT AUTO COOL DARK LITE INFO GOOD NEED WARN FAIL NEXT SKIP STOP DONE ACTV NONE BUSY KEYS VALS ONCE EVRY BFOR AFTR");
    defn("UNTL EVNT FILL TILE SPAN OPEN SHUT SELF VERT HORZ");
    defn("CLIENT SERVER SILENT FORGET");
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: ENVITYPE : string reference as the type of environment this script is running in
// ----------------------------------------------------------------------------------------------------------------------------
    defn({ENVITYPE:(function()
    {
        if(((typeof window)!="undefined")&&((typeof __dirname)!="string")){return "web"};
        if(((typeof browser)!="undefined")&&!!browser.browserAction&&((typeof browser.browserAction.getPopup)=="function"))
        {return "ext"}; return "njs";
    }())});

    defn({CLIENTSIDE:(ENVITYPE!="njs"), SERVERSIDE:(ENVITYPE=="njs")});
// ----------------------------------------------------------------------------------------------------------------------------




// func :: runsAt : to use when expected to run at CLIENT or SERVER
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function runsAt(w)
    {
        if((w!=CLIENT)&&(w!=SERVER)){return}; let m=`only available at ${w}`; // validation
        if((w==CLIENT)&&(ENVITYPE=="njs")){fail(m); return FALS};
        if((w==SERVER)&&(ENVITYPE!="njs")){fail(m); return FALS};
        return TRUE;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: PROTOCOL : string reference as the URL-schema of the environment this script is running in
// ----------------------------------------------------------------------------------------------------------------------------
    defn({PROTOCOL:(function()
    {
        if(ENVITYPE=="web"){return location.protocol};
        if(ENVITYPE=="njs"){return "file"};
        return "webext";
    }())});
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: HOSTNAME : string reference as the name of the machine this script is running in
// ----------------------------------------------------------------------------------------------------------------------------
    defn({HOSTNAME:(function()
    {
        if(ENVITYPE=="web"){return location.hostname};
        if(ENVITYPE=="njs"){let os,hn; os=require("os"); hn=os.hostname(); os=VOID; return hn};
        return ":webext:";
    }())});
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: HOSTPURL : string reference as a path-URL of the host running this script
// ----------------------------------------------------------------------------------------------------------------------------
    defn({HOSTPURL:(function()
    {
        if(ENVITYPE=="web"){return (PROTOCOL+"://"+HOSTNAME)};
        if(ENVITYPE=="njs"){return process.cwd()};
        return "webext";
    }())});
// ----------------------------------------------------------------------------------------------------------------------------




// func :: span : length of anything .. spanIs -to verify/assert span
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function span(d,x)
    {
        if((d===NULL)||(d===VOID)||(!d&&isNaN(d))){return 0};  if(!isNaN(d)){d=(d+"")};
        if(x&&((typeof x)=="string")&&((typeof d)=="string")){d=(d.split(x).length-1); return d};
        let s=d.length; if(!isNaN(s)){return s;};
        try{s=Object.getOwnPropertyNames(d).length; return s;}
        catch(e){return 0;}
    });

    hard(function spanIs(d,g,l){let s=(((typeof d)=='number')?d:span(d)); g=(g||0); l=(l||s); return ((s>=g)&&(s<=l))});
// ----------------------------------------------------------------------------------------------------------------------------



// shiv :: (types) : shorthands to identify variables .. g & l is "greater-than" & "less-than" -which counts items inside v
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function isVoid(v){return ((v===VOID)||(v===null))});
    hard(function isBool(v){return ((v===TRUE)||(v===FALS))});

    hard(function isNumr(v,g,l){if(!((typeof v)==='number')||isNaN(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))});
    hard(function isFrac(v,g,l){if(!(isNumr(v)&&((v+'').indexOf('.')>0))){return FALS}; return (isVoid(g)||spanIs(v,g,l))});
    hard(function isInum(v,g,l){if(!isNumr(v)||isFrac(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))});

    hard(function isText(v,g,l){if(!((typeof v)==='string')){return FALS}; return (isVoid(g)||spanIs(v,g,l))});
    hard(function isWord(v,g,l){if(!test(trim(v,'_'),/^([a-zA-Z])([a-zA-Z0-9_]{1,35})+$/)){return}; return (isVoid(g)||spanIs(v,g,l))});
    hard(function isJson(v,g,l){return (isin(['[]','{}','""'],wrapOf(v))?TRUE:FALS);});
    hard(function isPath(v,g,l){if(!test(v,/^([a-zA-Z0-9-\/\._@~$]){1,432}$/)){return FALS}; return ((v[0]=='/')&&(isVoid(g)||spanIs(v,g,l)))});
    hard(function isDurl(v,g,l){return (isText(v)&&(v.indexOf('data:')===0)&&(v.indexOf(';base64,')>0));});
    hard(function isPurl(v,g,l)
    {
        if(!isText(v)){return FALS}; let t=v.split("?")[0].split("://")[1]; if(!t){return FALS};
        return (isVoid(g)||spanIs(v,g,l));
    });

    hard(function isList(v,g,l)
    {
        let t=Object.prototype.toString.call(v).toLowerCase();
        if((t.indexOf('arra')<0)&&(t.indexOf('argu')<0)&&(t.indexOf('list')<0)&&(t.indexOf('coll')<0)){return FALS};
        return (isVoid(g)||spanIs(v,g,l))
    });

    hard(function isKnob(v,g,l)
    {if(((typeof v)!='object')||isList(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))});

    hard(function isFunc(v,g,l){if(!((typeof v)==='function')){return FALS}; return TRUE});

    hard(function isNode(v,g,l)
    {
        if(isVoid(v)||((typeof v)!='object')){return FALS}; if((typeof v.getBoundingClientRect)!='function'){return FALS};
        return (isVoid(g)||spanIs(v.childNodes.length,g,l))
    });

    hard(function isTemp(v){return (v instanceof DocumentFragment)});
// ----------------------------------------------------------------------------------------------------------------------------




// shiv :: (trim) : trim either white-space or substring from begin -and/or end of string
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function ltrim(t,c)
    {
        if(!isText(t,1)){return t}; if(c===VOID){return t.replace(/^\s+/g,'')};
        if(isNumr(c)){c=(c+'')}; if(!isText(c)){return t}; let s=c.length; while(t.indexOf(c)===0){t=t.slice(s);}; return t;
    });

    hard(function rtrim(t,c)
    {
        if(!isText(t,1)){return t}; if(c===VOID){return t.replace(/\s+$/g,'')};
        if(isNumr(c)){c=(c+'')}; if(!isText(c)){return t}; let s=c.length;
        while(t.slice((0-s))==c){t=t.slice(0,(t.length-s));};
        return t;
    });

    hard(function trim(t,b,e)
    {
        if(!isText(t,1)){return t}; if((b===VOID)&&(e===VOID)){return t.trim();}; if(isNumr(b)){b=(b+'')};
        if(e===VOID){e=b}else if(isNumr(e)){e=(b+'')}; if(b===e){t=rtrim(ltrim(t,b),e); return t;};
        if(b&&!e){return ltrim(t,b)}; if(e&&!b){return rtrim(t,e)}; return t;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: stub : split once on first occurance of delimeter
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function stub(t,a)
   {
      var c,i,b,e,s; c=isin(t,a); if(!c){return};
      s=c.length; i=t.indexOf(c);  b=((i>0)?t.slice(0,i):'');  e=(t[(i+s)]?t.slice((i+s)):'');  return [b,c,e];
   });

   hard(function rstub(t,a)
   {
      var c,i,b,e,a,s;  c=isin(t,a); if(!c){return};
      s=c.length; i=t.lastIndexOf(c); b=((i>0)?t.slice(0,i):''); e=(t[(i+s)]?t.slice((i+s)):'');  return [b,c,e];
   });
// ----------------------------------------------------------------------------------------------------------------------------




// shiv :: (case) : set -and test text-case
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function lowerCase(v){if(!isText(v,1)){return v}; return v.toLowerCase()});
   hard(function upperCase(v){if(!isText(v,1)){return v}; return v.toUpperCase()});
   hard(function proprCase(v){if(!isText(v,1)){return v}; return (v[0].toUpperCase()+(v[1]?v.substring(1).toLowerCase():''))});
   hard(function camelCase(v,camlBack)
   {
       if(!isText(v,1)){return v}; v=v.toLowerCase().split(' ').join('-'); let r='';
       v.split('-').forEach((i)=>{r+=proprCase(i)});
       if(!camlBack){return r;}; let f=r.slice(0,1); r=r.slice(1); return (f.toLowerCase()+r);
   });

   hard(function isLowerCase(v){return (v===lowerCase(v));});
   hard(function isUpperCase(v){return (v===upperCase(v));});
   hard(function isProprCase(v){return (v===proprCase(v));});
   hard(function isCamelCase(v,cb){return (v===camelCase(v,cb));});
// ----------------------------------------------------------------------------------------------------------------------------




// func :: escapeHtml : sanitise text for safer HTML rendering
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function escapeHtml(text)
    {
        if(!isText(text)){return text};

        var map = // object
        {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };

        return text.replace(/[&<>"']/g, function(m){return map[m];});
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: test : test a string against some Regex pattern
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function test(v,x)
    {
        if(((typeof v)!="string")||(v.length<1)){return FALS}; if(!x){return};
        if((typeof x)=="string"){if(wrapOf(x)!=="//"){return}; x=(new RegExp(x));}; if(!x){return};
        if(x.constructor&&(x.constructor.name=="RegExp")){return (x.test(v)?TRUE:FALS)};
        if(isFunc(x)){return x(v)};
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: what : concise `typeof` .. returns 4-letter word, or undefined
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function what(v)
    {
        let l=("Void,Bool,Numr,Text,List,Knob,Func").split(",");
        for(let i in l){if(!l.hasOwnProperty(i)){continue}; if(MAIN[`is${l[i]}`](v)){return l[i].toLowerCase()}};
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: keys/vals : return a list of own-keys, or own-values of an object .. returns empty array if invalid
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function keys(o,x)
    {
        if(!isKnob(o)&&!isList(o)&&!isFunc(o)){return []}; // validation .. array is expected as return value
        let r=Object.getOwnPropertyNames(o); if(!isNumr(x)){return r}; // get properties .. return all
        if(x<0){x=((r.length-1)+x)}; return r[x];
    });

    hard(function vals(o,x)
    {
      let r=[]; keys(o).forEach((k)=>{r.push(o[k])});
      if(!isNumr(x)){return r}; if(x<0){x=((r.length-1)+x)};
      return r[x];
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: seen : returns the value of the first occurence in given context -or undefined .. if no x is given -MAIN is assumed
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function seen(f,x)
    {
        if(isVoid(x)&&isText(f,1)){return (new Function(`try{return ${f};}catch(e){};`))();}; // global / constant
        if(!x||(x===TRUE)||(f===VOID)){return}; // validation .. no search-able context, or trying to find `undefined`
        if(isNumr(x)){x=(x+""); if(isNumr(f)){f=(f+"");}}; // turn numbers into strings for searching
        if(!isFunc(x.indexOf)){x=keys(x);}; if(!x.length){return}; // validation
        if(!isList(f)){return ((x.indexOf(f)>-1)?f:VOID)}; // single search
        for(let i in f){if(!f.hasOwnProperty(i)){continue}; if(x.indexOf(f[i])>-1){return f[i]}}; // bulk search
    });

    hard(function isin(x,f){return seen(f,x)}); // syntax sugar .. reversed params for `seen`
// ----------------------------------------------------------------------------------------------------------------------------




// func :: mean : parse text into meaning
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function mean(v,km,vm, s,k,r)
    {
        if(!isText(v,1)){return};  let t=v.trim();  if(!t){return v}; v=VOID; // obvious stuff out the way
        try{let r=JSON.parse(t); return r}catch(e){}; // JSON does most of the heavy lifting
        t=t.split(";").join("\n"); if(isin(t,"\n"))
        {
            r={}; t.split("\n").forEach((l)=>
            {
                let o=mean(l,km,vm); if(!isKnob(o)){r[span(r)]=o; return};
                k=keys(o)[0]; r[k]=o[k];
            });
            return r;
        };

        if(isin(t,['"',"`"])){return v}; // ignore multi-line or too complex
        s=stub(t,":"); if(s)
        {k=trim(s[0]," "); if(isin(k,[" ",","])){return t}; if(km){k=km(k)}; v=mean(s[2]); if(vm){v=vm(v)}; return {[k]:v}};
        if(!isin(t,",")){return t}; // not a list
        r=[]; t.split(",").forEach((i)=>{r.radd(mean(i))});
        return r;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: text : parse meaning into text
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function text(v,w, r)
    {
        if((v===VOID)||isFunc(v)||isText(v)){return (v+"")};
        try{r=JSON.stringify(v);}catch(e){r=(v+"")};
        return (r||"");
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: bore : get/set/rip keys of objects by dot -or slash delimiter
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function bore(o,k,v)
    {
        if(((typeof k)!='string')||(k.trim().length<1)){return}; // invalid
        if(seen("/",k)&&!seen(".",k)){k=k.split("/").join(".")}; // slashes to dots
        if(v===VOID){return (new Function("a",`return a.${k}`))(o)}; // get
        if(v===NULL){(new Function("a",`delete a.${k}`))(o); return TRUE}; // rip
        (new Function("a","z",`a.${k}=z`))(o,v); return TRUE; // set
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: rename : define/change the name of a function
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function rename(f,n)
    {
        if(isText(f)){let t=f; f=n; n=t}; // swap args
        if(((typeof f)!='function')||((typeof n)!='string')||(n.trim().length<1)){return}; // validate
        f=f.toString(); f=f.slice(f.indexOf('(')); let r=(new Function("a",`return {[a]:function${f}}[a];`))(n);
        return r;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: extend : define hardened properties -- neat shorthand to define multiple immutable properties of multiple targets
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function extend()
   {
      var a = [].slice.call(arguments);
      return (function(d)
      {
         if(!isKnob(d)){return}; var o = {writable:FALS,enumerable:FALS,configurable:FALS,value:TRUE};  var r=TRUE;  a.forEach((i)=>
         {
            if((['o','f'].indexOf((typeof i)[0])<0)){r=FALS;return};  var m=(i.MAINROLE?TRUE:FALS);  var t=VOID;  for(var p in d)
            {
               if(!d.hasOwnProperty(p)){continue;};  var v=d[p];  var c={enumerable:FALS,configurable:FALS,writable:FALS};
               t=(typeof v)[0];if(v&&m&&((t=='f')||(t=='o'))){try{Object.defineProperty(v,'INTRINSIC',o)}catch(e){r=FALS;return}};
               c.value=v; if((t=='f')||(t=='o')){Object.defineProperty(v,'name',{writable:FALS,enumerable:FALS,configurable:FALS,value:p})};
               if(p=='each'){c.writable=TRUE}; try{Object.defineProperty(i,p,c)}catch(e){r=FALS;};
            };
            return r;
         });
      });
   });

   extend(Math)({name:'Math'});  extend(console)({name:'console'});
// ----------------------------------------------------------------------------------------------------------------------------




// func :: isConstructor : check if given arg is a constructor
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function isConstructor(f)
    {
        try{new f();}catch(e){if(e.message.indexOf('not a constructor')>=0){return FALS;}};
        return TRUE;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: listOf : convert into list
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function listOf(a)
    {
        if(isList(a))
        {
            if(!!a.forEach&&!!a.pop){return a};
            return ([].slice.call(a));
        };
        return [a];
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: pathOf : get path from string
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function pathOf(v)
   {
      if(!isText(v)){return}; let r=trim(v); if(!r){return}; if(isPath(r)){return r;}; if(r.startsWith("~")){return ("/"+r);};
      if(!isText(v,2)){return}; r=v; if(isin(r,'://')){r=r.split('://')[1]}; r=stub(r,'/'); if(!r){return};
      r=('/'+r[2]); r=r.split('//').join('/'); r=r.split(' ').join('_'); r=r.split('?')[0];
      return (isPath(r)?r:VOID);
   });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: fext : get valid file extension from path
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function fext(p)
   {
      let r=pathOf(p); if(!r){r=pathOf('/'+p); if(!r){return}}; let b=r.split('/').pop();
      if(!isin(b,'.')){return}; r=b.split('.').pop();
      if(test(r,/^[a-zA-Z0-9]{1,8}$/)){return r};
   });
// ----------------------------------------------------------------------------------------------------------------------------




// shiv :: (wrap) : related to distinct first and last character pairs in text
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function isWrap(v, r,l)
   {
      if(!isText(v,2)){return FALS}; r=(v.slice(0,1)+v.slice(-1)); l="\"\" '' `` {} [] () <> // :: \\\\ **".split(" ");
      return ((l.indexOf(r)<0)?FALS:r);
   });

   hard(function wrapOf(v, w){w=isWrap(v); return (w?w:'')});
   hard(function unwrap(v, w){w=isWrap(v); return (w?v.slice(1,-1):v)});
// ----------------------------------------------------------------------------------------------------------------------------




// func :: akin : check if needle is similar to hastack .. as in: "begins-with", "ends-with" or "contains" .. marked with `*`
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function akin(h,n, l,f,p,b,e)
   {
      if(!isText(h,1)||!isText(n,1)){return}; if(n.indexOf('*')<0){return (h===n)}; // validate
      if(n.indexOf('**')>-1){if(n.startsWith('**')||n.endsWith('**')){return;}}; // validate
      if(n==='*'){return TRUE;};if(n.length<2){return};if(wrapOf(n==='**')){n=unwrap(n); return (h.indexOf(n)>-1)}; // contains
      if(n.startsWith('*')){n=ltrim(n,'*'); return h.endsWith(n);}; // ends-with
      if(n.slice(-1)==='*'){n=rtrim(n,'*'); return h.startsWith(n);}; // starts-with
      if(n.indexOf('**')<1){return FALS;}; p=n.split('**');
      b=akin(h,(p[0]+'*')); e=akin(h,('*'+p[1])); return (b&&e); // starts-&-ends-with
   });
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: time : returns seconds
// ----------------------------------------------------------------------------------------------------------------------------
   extend(MAIN)
   ({
      round:function round(n,d, r)
      {
         if(!isNumr(n)){return}; if(isInum(n)){return n}; if(!d||!isInum(d)){return Math.round(n)}; r=n.toFixed(d);
         r=rtrim(rtrim(r,'0'),'.'); r=(r*1); return r;
      },
      time:function time(d)
      {
         let r=(Date.now()/1000);
         if(!isInum(d)){return Math.round(r);};
         return round(r,d);
      },
   });
// ----------------------------------------------------------------------------------------------------------------------------




// shiv :: (array) : tools for arrays
// ----------------------------------------------------------------------------------------------------------------------------
   extend(Array.prototype)
   ({
      ladd:function(i){this.unshift(i); return this},
      radd:function(i){this[this.length]=i; return this},

      lpop:function(n, r)
      {
          if(!n){r=this.shift(); return r;};
          if(n===true){this.shift(); return this;};
      },
      rpop:function(n, r)
      {
          if(!n){r=this.pop(); return r;};
          if(n===true){this.pop(); return this;};
      },

      last:function(i){let z=(this.length-1); if(i){return z}; return ((z<0)?VOID:this[z])},
      item:function(x){if(!isInum(x)){return}; if(x<0){x=(this.length+x)}; return this[x];},
   });

   const ladd = function(a,i){a.ladd(i); return a};
   const radd = function(a,i){a.radd(i); return a};

   const lpop = function(a,i){let r=a.lpop(); return r};
   const rpop = function(a,i){let r=a.rpop(); return r};

   const last = function(a,i){let r=a.last(i); return r};

   const args = function(a)
   {
       if(span(a)<1){return [];}; // void or empty
       if(!isList(a)){a=[a];}; // thing to arguments array
       if(isList(a[0])){a=a[0];}; // sub-arguments-array
       a=([].slice.call(a));
       return a;
   };
// ----------------------------------------------------------------------------------------------------------------------------




// shiv :: (array) : tools for arrays
// ----------------------------------------------------------------------------------------------------------------------------
   extend(Object.prototype)
   ({
       forEach:function forEach(cb)
       {
           for(let k in this)
           {
               if(!this.hasOwnProperty(k)){continue};
               let r=cb.apply(this,[this[k],k]); if(r===STOP){break};
           };
       },
   });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: nodeName : of element
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function nodeName(o)
   {
      if(isNode(o)){return o.nodeName.toLowerCase()}; if(isKnob(o)){return keys(o)[0]};
   });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: fail : error handling & trigger error
// ----------------------------------------------------------------------------------------------------------------------------
    extend(MAIN)
    ({
        fail:function fail(m, a,n,f,l,s,p,o)
        {
           if(MAIN.HALT){return}; MAIN.HALT=1; if(MAIN.Busy){Busy.tint("red")};
           tick.after(3000,()=>{MAIN.HALT=0; if(!isKnob(o)){return}; seenFail(o,FORGET)});
           if(wrapOf(m)=="{}"){m=JSON.parse(m);};
           if(isText(m))
           {
               if(isin(m,"evnt: ")&&isin(m,"\nmesg: "))
               {
                   a=m.split("\n"); lpop(a); m=stub(a[0],": ")[2]; n=stub(m,' - ');
                   if(n&&isWord(n[0])){m=n[2];n=n[0]}else{n="Undefined"};
                   f=stub(a[1],": ")[2]; l=stub(a[2],": ")[2]; a=decode.jso(atob(stub(a[3],": ")[2]));
                   s=[]; a.forEach((i)=>{radd(s,`${i.func} ${i.file} ${i.line}`)}); o={evnt:n,mesg:m,file:f,line:l,stak:s};
               }
               else
               {
                   if(!isin(m,' :: ')){m=('Usage :: '+m);}; n=stub(m,' :: '); m=n[2]; n=n[0]; s=stak(); p=(s[0]||"").split(" ");
                   o={evnt:n,mesg:m,file:p[1],line:p[2],stak:s};
               };
           }
           else
           {
               if(!isKnob(m)){moan(m); alert("an error has occurred, me scuzi"); return};
               m.evnt=(m.evnt||m.name); if(!m.evnt){p=stub(m.mesg," - "); if(p&&isWord(p[0])){m.evnt=p[0]; m.mesg=p[2]}};
               m.stak=(m.stak||stak());
               if(isKnob(m.stak[0])){s=[]; m.stak.forEach((i)=>{radd(s,`${i.func} ${i.file} ${i.line}`)}); m.stak=s}; o=m;
           };


           if(seenFail(o)){return}; moan(o); emit("FAIL",o); return true;
       },

       seenFail:function seenFail(d,f, r)
       {
           d=md5(`${d.evnt}${d.mesg}${d.file}${d.line}`);
           if(f){delete this[d]; return};
           r=this[d]; if(r){return d};
           this[d]=1; return FALS;
       }.bind({}),
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: jack : intercept class-constructors or methods
// ----------------------------------------------------------------------------------------------------------------------------
    const jack = function(k,v,x)
    {
        if(((typeof k)!='string')||!k.trim()){return}; // invalid reference
        if(!!v&&((typeof v)!='function')){return}; // invalid callback func
        if(!v){return this[k]}; // return existing definition, or undefined
        if(k in this){this[k].list[(this[k].list.length)]=v; return}; //add
        if(!x||((typeof x)!='object')){x=VOID}; //  validate once as object
        let h,n,c,f; h=k.split('.'); n=h.pop(); h=h.join('.'); //short vars
        this[k]={func:bore(MAIN,k),list:[v],evnt:x}; // callback definition
        h=(h?bore(MAIN,h):MAIN); c=isConstructor(this[k].func); //obj & con
        this[k].cons=c; bore(MAIN,k,null); //set cons & delete the original

        f=function()
        {
            let n,r,j,a,z,q; j='_fake_'; r=stak(0,j); r=(r||'').split(' ')[0];
            if(r.startsWith(j)||(r.indexOf(`.${j}`)>0)){n=(r.split(j).pop())};
            if(!n&&(r=='new')&&!!this.constructor){n=this.constructor.name;};
            if(!n){moan(`can't jack "${r}"`);return}; r=jack(n);
            a=([].slice.call(arguments)); for(let p in r.list)
            {if(!r.list.hasOwnProperty(p)){continue}; let i=rename(j,r.list[p]);
            q=i.apply(this,a); if(q!=VOID){break};}; if(!Array.isArray(q)){q=[q]};
            try{if(!r.cons){z=r.func.apply(this,q)}else
            {z=(new (Function.prototype.bind.apply(r.func,[null].concat(a))));}}
            catch(e){if(!!r.evnt&&!!r.evnt.error){r.evnt.error(e)}
            else{moan(e)};return}; if(!!r.evnt&&!!z.addEventListener)
            {for(let en in r.evnt){if(r.evnt.hasOwnProperty(en))
            {z.addEventListener(en,r.evnt[en],false)}}}; return z;
        };

        if(!c){f=rename(`_fake_${k}`,f)}; bake(h,n,f);
        try{h[n].prototype=Object.create(this[k].func.prototype)}catch(e){};
    }.bind({});

    bake(jack);

    hard(function hijack(l,f)
    {
        if(isList(l)){l.forEach((i)=>{jack(i,f)})};
        if(isKnob(l)){l.forEach((v,k)=>{jack(k,v)})};
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: stak : get call-stack .. returns array of text (per stack-item) .. should be compatible with all modern platforms
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function stak(x,a, e,s,r,h,o)
    {
        if((x+"").indexOf(" ")){s=x.split("\n"); x=VOID}
        else{e=(new Error(".")); s=e.stack.split("\n")};

        a=(a||""); s.shift(); r=[]; o=["_fake_"]; // omit

        s.forEach((i)=>
        {
            if(CLIENTSIDE&&(i.indexOf(HOSTPURL)<0)){return}; // web security
            let p,c,f,l,q; q=1; p=i.trim().split(HOSTPURL);
            c=p[0].split("@").join("").split("at ").join("").trim(); c=c.split(" ")[0]; if(!c){c="anon"};
            o.forEach((y)=>{if(((c.indexOf(y)==0)||(c.indexOf("."+y)>0))&&(a.indexOf(y)<0)){q=0}}); if(!q){return};
            p=(p[1]||p[0]).split(" "); f=p[0]; if(f.indexOf(":")>0){p=f.split(":"); f=p[0]}else{p=p.pop().split(":")};
            if((c=="stak")||(f=="/")){return}; l=p[1]; l=([c,f,l]).join(" "); if(l.indexOf(" at ")>-1){return};
            r[r.length]=l;
        });

        if(!isNaN(x*1)){return r[x]}; return r;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: herald : upgrade given object to listen `upon` and `emit` events in its own scope
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function herald(o)
    {
        if(!o){return}; // invalid

        if(!o.upon)
        {
            extend(o)
            ({
                upon:function upon(en,cb,bl)
                {
                    let me=(this||MAIN);
                    if(isKnob(en)){en.forEach((v,k)=>{me.upon(k,v)}); return true};
                    if(!me.upon.events[en]){me.upon.events[en]=[]}; me.upon.events[en].push(cb);
                    if(me.on){this.on(en,cb); return true};
                    if(me.addEventListener){me.addEventListener(en,cb,(bl?true:false)); return true};
                    return true;
                },
            });
            extend(o.upon)({events:{}});
        };

        if(!o.emit)
        {
            extend(o)
            ({
                emit:function(en,ev)
                {
                    let me=(this||MAIN);
                    if(me.dispatchEvent){me.dispatchEvent((new CustomEvent(en,{detail:ev}))); return true};
                    (me.upon.events[en]||[]).forEach((cb)=>{cb({detail:ev})}); return true;
                },
            });
        };
    });

    herald(MAIN);


    if(CLIENTSIDE)
    {
        MAIN.upon("error",function errorHandler(event)
        {
            let e,m,f,l,s,i,n,h,o; event.preventDefault(); event.stopPropagation(); e=event.error;
            f=event.filename; l=event.lineno; if(!e||isText(e)||((e.stack+"").indexOf("\n")<0)){e=(new Error((e+"")))};
            n=(e.name||"usage"); m=e.message; if(!f){f=fail.maybe;}; if(!l){l=0;}; s=stak(); h=`https://${HOSTNAME}`;
            f=ltrim(f,h); o={name:n, mesg:m, file:f, line:l, stak:s}; if(MAIN.HALT){return}; MAIN.HALT=1;

            if(MAIN.Busy){Busy.tint("red")};
            tick.after(3000,()=>{MAIN.HALT=0; if(!isKnob(o)){return}; seenFail(o,FORGET)});
            moan(o); emit("FAIL",o);
        });
    }
    else
    {
        process.on("uncaughtException",function errorHandler(e)
        {
            let m,f,l,s,p,o,n; m=e.message; s=stak(e.stack);
            if(!isList(s,1)){moan(m); process.exit(1); return}; // bad error

            p=s[0].split(" "); n=p[0]; f=p[1]; l=(p[2]*1);
            o={name:n, mesg:m, file:f, line:l, stak:s}; if(MAIN.HALT){return}; MAIN.HALT=1;
            tick.after(3000,()=>{MAIN.HALT=0; if(!isKnob(o)){return}; seenFail(o,FORGET)});
            moan(o); emit("FAIL",o);
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// func :: tick : nice syntax for setTimeout and setInterval
// ----------------------------------------------------------------------------------------------------------------------------
    extend(MAIN)
    ({
        tick:
        {
            after:function after(frst,scnd)
            {
                if(isFrac(frst)){frst=Math.floor(frst*1000)}; // fraction to seconds
                if(!isFunc(scnd)){fail("2nd arg must be a function"); return}; // validation

                if(isNumr(frst)){let timr=setTimeout(scnd,frst); return timr}; // simple timeout
                if(isFunc(frst)&&isFunc(scnd)){scnd(frst());}; // syntax sugar
            },


            every:function every(frst,scnd,slow,lmit)
            {
                if(isFrac(frst)){frst=Math.floor(frst*1000)}; // fraction to seconds
                if(!isFunc(scnd)){fail("2nd arg must be a function"); return}; // validation
                if(!isInum(slow)||(slow<0)){slow=0}; if(!isInum(lmit)||(lmit<0)){lmit=null}; // normalize to prevent issues

                if(isNumr(frst))
                {
                    lmit=slow; if(!lmit){return setInterval(scnd,frst)}; // simple interval
                    let timr=setInterval(()=>{scnd(); lmit--; if(lmit<0){clearInterval(timr)};},frst);
                    return timr;
                };

                if(isFunc(frst)&&isFunc(scnd))
                {
                    let timr=setInterval(()=>
                    {
                        if(lmit!==null){lmit--; if(lmit<0){clearInterval(timr); return}};
                        let resl=frst(); if(resl||(resl===0)){scnd()};
                    },slow);
                    return timr;
                };
            },


            until:function until(frst,scnd,slow,lmit)
            {
                if(!isFunc(frst)){fail("1st arg must be a function"); return}; // validation
                if(!isFunc(scnd)){fail("2nd arg must be a function"); return}; // validation
                if(!isInum(slow)||(slow<0)){slow=0}; if(!isInum(lmit)||(lmit<0)){lmit=0}; // normalize to prevent issues

                let timr=setInterval(()=>
                {
                    if(lmit!==null){lmit--; if(lmit<0){clearInterval(timr); return}};
                    let resl=frst(); if(resl||(resl===0)){clearInterval(timr); scnd();};
                },slow);
                return timr;
            },
        },


        after:function after(a){return function runAfter(b){return tick.after(a,b);}},
        every:function every(a,s,l){return function runEvery(b){return tick.every(a,b,s,l);}},
        until:function until(a,s,l){return function runUntil(b){return tick.until(a,b,s,l);}},
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: trap : neat Proxy
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function trap(trgt,nick)
    {
        if(isText(trgt)){nick=trgt; trgt=(seen(trgt)||function(){});}; // given string
        return function(o)
        {
            if(isFunc(o)){o={get:o,set:o,apply:o,construct:o}};
            let r=(new Proxy(trgt,o)); if(!isWord(nick)){return r};
            extend(MAIN)({[nick]:r}); return r;
        };
    });

    extend(Object.prototype,Function.prototype)
    ({
        trap:function trap(o)
        {
            if(isFunc(o)){o={get:o,set:o,apply:o,construct:o}};
            if(!isKnob(o)){fail("invalid argument"); return}; // validation
            return (new Proxy(this,o));
        },
    });
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: expect : for validation .. usage: expect.bool(123); // throws error because 123 is not boolean
// ----------------------------------------------------------------------------------------------------------------------------
    trap("expect")
    ({
        get:function(o,k)
        {
            return function(v,c, r,m)
            {
                r=FALS; k=k.split(' ').join(",").split(","); m="";
                k.forEach((i)=>{let f=seen('is'+proprCase(i)); if(f&&f(v,c)){r=TRUE}});
                if(r){return TRUE}; // no issues .. all is well
                k=k.join(', or '); if(isNumr(c)){m=` -which must contain ${c} item(s) or more`};
                fail('type :: expecting '+k+m);
            };
        },
        apply:function(o,x,a, r)
        {
            a=a[0]; if(!isKnob(a)){fail('calling `expect` directly requires an object');return}; r=true;
            a.forEach((v,k)=>{let f=seen('is'+proprCase(k)); if(f&&!f(v)){fail('type :: expecting '+k); r=false;}});
            return r;
        },
    });
// ----------------------------------------------------------------------------------------------------------------------------




// shim :: md5 : hashing function .. usage: md5("whatever");
// ----------------------------------------------------------------------------------------------------------------------------
   !function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);
// ----------------------------------------------------------------------------------------------------------------------------




// func :: fash : fast performing hash function .. returns md5
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function fash(v)
   {
      if(v==VOID){v=(performance.now()+''+(Math.random().toString(36).slice(2,12)));}else{v=text(v)};
      return md5(v);
   });
// ----------------------------------------------------------------------------------------------------------------------------



// func :: swap : replace substrings .. yes it's a bit slower than [whatever], but it's handy and has no "issues"
// ----------------------------------------------------------------------------------------------------------------------------
   hard(function swap(s,f,r)
   {
      if(!isText(s)){return}; if(isNumr(f)){f=(f+'')}; if(isNumr(r)){r=(r+'')}; // normalize
      if(isText(f)&&isText(r)){s=s.split(f).join(r); return s}; // all text
      if(isList(f)&&isText(r)){f.forEach((i,x)=>{s=s.split(i).join(r);}); return s}; // list of things to find & replace with r
      if(isList(f)&&isList(r)){f.forEach((i,x)=>{s=s.split(i).join(r[x]);}); return s}; // find & replace in order of f & r
      return s;
   });

   extend(String.prototype)
   ({
       swap:function swap(f,r){return MAIN.swap(this,f,r);}, // to use like: "whatever".swap("ever","what"); // whatwhat
   });
// ----------------------------------------------------------------------------------------------------------------------------




// shim :: (Object.indexOf) : find an object key like this: {foo:123}.indexOf(123); // foo
// ----------------------------------------------------------------------------------------------------------------------------
    extend(Object.prototype)
    ({
        indexOf:function indexOf(x)
        {
            let k,v,i; k=keys(this); v=vals(this); i=v.indexOf(x);
            if(i<0){return i}; return k[i];
        },
    });
// ----------------------------------------------------------------------------------------------------------------------------




// shim :: (Function.join) : extend function to access properties like `this.whatever` -even externally
// ----------------------------------------------------------------------------------------------------------------------------
    extend(Function.prototype)
    ({
        join:function join(o)
        {
            if(!expect.knob(o)){return};
            let r=this.bind(o); o.forEach((v,k)=>{r[k]=v});
            return r;
        },
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: copyOf : duplicate .. if numr or text then n repeats n-times
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function copyOf(v,n, r)
    {
        if(isVoid(v)||(v===null)||(v==="")||isBool(v)){return v};
        if(isNumr(v)||isText(v)){if(!n){return v}; v=(v+''); n=parseInt(n); r=''; for(let i=0;i<n;i++){r+=v}; return r};
        if(((typeof Element)!=="undefined")&&(v instanceof Element)){return (v.cloneNode(true))};
        if(isList(v)){r=[]; v=([].slice.call(v)); v.forEach((i)=>{r.push(copyOf(i))}); return r};
        if(isFunc(v)){r=new Function('return ' + this.toString())(); this.forEach((v,k)=>{r[k]=copyOf(v)}); return r;};
        if(isKnob(v)){r={}; for(let k in v){if(!v.hasOwnProperty(k)){continue}; r[k]=copyOf(v[k])}; return r};
    });
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: encode/decode : unified syntax for various encoding and decoding methods
// ----------------------------------------------------------------------------------------------------------------------------
    extend(MAIN)
    ({
        encode:
        {
            blo:function(arg1,type)
            {
                if(isList(arg1)||isText(arg1))
                {
                    var resl = (new Blob([arg1],{type:(type||'text/plain')}));
                    return resl;
                };

                if(isKnob(arg1)&&(isText(arg1.mime)||isText(arg1.type))&&!!arg1.data)
                {
                    let l,s,a,r; s=arg1.data.length; l=(new Array(s));
                    for(let i=0; i<s; i++){l[i]=arg1.data.charCodeAt(i)};
                    a=(new Uint8Array(l)); r=(new Blob([a],{type:trim(arg1.mime)}));
                    return r;
                };
            },

            jso:function jso(what)
            {
                let resl=VOID; try{resl=JSON.stringify(what)}catch(e){};
                return resl;
            },

            b64:function b64(what)
            {
                let resl=VOID; try{resl=btoa(what)}catch(e){};
                return resl;
            },

            uri:function uri(what)
            {
                let resl=VOID; try{resl=encodeURIComponent(what)}catch(e){};
                return resl;
            },

            atr:function atr(o)
            {
                if(!isKnob(o)){return}; let r=[];
                o.forEach((v,k)=>{r.radd(`${k}="${v}"`)});
                r=r.join(" "); return r;
            },

            pty:function pty(o)
            {
                if(!isKnob(o)){return}; let r=[];
                o.forEach((v,k)=>{r.radd(`${k}: ${v}`)});
                r=r.join(";"); return r;
            },
        },


        decode:
        {
            blo:function blo(d,f)
            {
                if((d instanceof Blob)||(!!d&&isPath(`/${d.type}`)&&isInum(d.size)&&isInum(d.lastModified)))
                {
                    var p=(new FileReader()); p.onloadend=function(){f(p.result);};
                    p.readAsDataURL(d); return;
                };

                if(isKnob(d)&&(isText(d.mime)||isText(d.type)))
                {
                    let r=encode.BLOB(d.type);
                    if(!r){fail("Type :: invalid blob(ish) object"); return};
                    decode.BLOB(r,f); return;
                };

                fail("Args :: invalid 1st parameter");
            },

            jso:function jso(what)
            {
                let resl=VOID; try{resl=JSON.parse(what)}catch(e){};
                return resl;
            },

            b64:function b64(what)
            {
                let resl=VOID; try{resl=atob(what)}catch(e){};
                return resl;
            },

            uri:function uri(what)
            {
                let resl=VOID; try{resl=decodeURIComponent(what)}catch(e){};
                return resl;
            },

            atr:function atr(d)
            {
                if(isText(d)){d=d.trim()}; if(!isText(d,1)){return}; let l,r,k;
                l=d.split('\n').join(' '); l+=' '; l=swap(l,['   ','  '],' '); r={};
                l.split('" ').forEach((i)=>{i=i.trim().split('="'); k=trim(i[0]); if(!k){return}; let v=sval(i[1]); r[k]=v});
                return r;
            },

            pty:function pty(d)
            {
                return mean(d);
            },
        },
    });
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: global : less smelly global-variables
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function global(d,f, fs,si,y,r,rb)
    {
        fs=stak(); if(!fs){comoan("forbidden",fs);return}; // get the call-stack, if empty -> wack the abuser, else use it for from-auth
        if((f!==VOID)&&!isList(f)){fail("invalid 2nd arg");return}; // verify auth, must be text-list, or VOID
        if(f){y=0;f.forEach((p)=>{if(!isText(p)){fail("invalid 2nd arg");y=1}}); if(y){return}}; // verify each text if from-auth
        if(isText(d,1)){return copyOf(this.vars[d])}; if(!isKnob(d,1)){return}; // return copy of requested value, or VOID if not object
        // below will attempt to create/update global variables using from-auth security (if any -else it's immutable)
        si=rstub(fs[1]," ")[0]; rb=true; d.forEach((v,k)=>
        {
            if(k.length<1){return}; r=this.vars[k]; // sanitize & prep
            if(r===VOID){this.vars[k]=v; this.auth[k]=f; return}; // not defined yet, so create it now using auth-from (if any)
            if(!isin(this.auth[k],si)){rb=false; moan("forbidden",fs); return STOP}; // not authorized to change this variable
            this.vars[k]=v; // update existing variable, cannot re-auth, only initial creation can set auth
        });
        return rb;
    }
    .bind({vars:{},auth:{}}));
// ----------------------------------------------------------------------------------------------------------------------------




// shim :: String.expose : returns a list of items found in string wrapped inside string-pair
// ----------------------------------------------------------------------------------------------------------------------------
    extend(String.prototype)
    ({
        expose:function expose(b,e,x)
        {
            if(!isText(t,1)||!isText(b,1)||!isText(e,1)||(t.indexOf(b)<0)||(t.indexOf(e)<0)){return};  // validate
            let t,r,ml,xb,xe,xs,bl,el; t=(this+""); bl=b.length; el=e.length; ml=(bl+el); if(t.length<(ml+1)){return}; r=[];
            do
            {
                xb=t.indexOf(b); if(xb<0){break}; xe=t.indexOf(e,(xb+bl)); if(xe<0){break};
                xs=t.slice((xb+bl),xe); if(!x||test(xs,x)){r.push(xs); t=t.slice((xe+el));}else{t=t.slice(xe);};
            }
            while((t.length>ml)&&(xb>-1)&&(xe>-1));
            return ((r.length>0)?r:VOID);
        }
    });
// ----------------------------------------------------------------------------------------------------------------------------




// shim :: (libs) : misc tools
// ----------------------------------------------------------------------------------------------------------------------------
    if(SERVERSIDE)
    {
        hard("http",require("http"));
        hard("fsys",require("fs"));

        hard(function btoa(arg)
        {return Buffer.from(arg).toString("base64");});

        hard(function atob(arg)
        {return Buffer.from(arg,"base64").toString();});
    }
    else
    {
        bake("http",
        {
            request:function request(opt,cbf, xhr)
            {
                if(isText(opt)){opt={target:opt};}; if(!isKnob(opt)){fail("invalid 1st argument"); return};
                if(!isKnob(opt.listen)){opt.listen={}}; if(isFunc(cbf)){opt.listen.loadend=cbf};
                xhr=(new XMLHttpRequest()); xhr.open((opt.method||"GET"),opt.target);
                opt.listen.forEach((v,k)=>{xhr.addEventListener(k,v)});
                if(isKnob(opt.header)){opt.header.forEach((v,k)=>{xhr.setRequestHeader(k,v)})};
                xhr.send((opt.convey?text(opt.convey):null));
            }
        });

        bake("fsys",
        {
            readFile:function readFile(pt,cb)
            {
                http.request(pt,function()
                {
                    let hd=mean(this.getAllResponseHeaders(),(k)=>{return camelCase(k,1)},(v)=>
                    {if(!isin(v,"=")){return v}; v=mean(v.swap(["=",","],[":",";"])); return v});
                    cb(this.response,hd);
                });
            },
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------





// tool :: file : disk tools
// ----------------------------------------------------------------------------------------------------------------------------
    trap("disk")({get:function(tgt,key,val)
    {
        if(!isFunc(fsys[key])){return tgt[key];};
        return function()
        {
            let a,k,r,z; a=listOf(arguments); k=this.k; r=disk.root; z=last(a);
            if(isPath(a[0])&&!a[0].startsWith(r)){a[0]=(r+a[0])};
            if(!isFunc(z)){k+="Sync";};
            return fsys[k].apply(fsys,a);
        }.bind({k:rtrim(key,"Sync")});
    }});
    disk.root=(CLIENTSIDE?"":(rtrim((__dirname),"/")||"/"));
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: server : for server and client
// ----------------------------------------------------------------------------------------------------------------------------
    extend(MAIN)
    ({
        server:
        {
            config:{mime:{html:"text/html",htm:"text/html",css:"text/css",js:"application/javascript"}},


            create:function create(addr,path,indx)
            {
                if(!addr){addr="127.0.0.1"}; if(!path){path=disk.root}; if(!indx){indx="/index.html"};

                let host = http.createServer(function(req,rsp)
                {
                    this.emit(req.method,[req,rsp]);
                    if(!!this.upon.events[req.method]){return}; // already handled
                    if(!this.upon.events.GET&&(req.method=="GET"))
                    {
                        let rp,mt,fd,tv,fx; rp=rtrim(req.url,"/"); rp=(this.path+(rp||this.indx));
                        if(!disk.exists(rp)){rsp.writeHead(404); rsp.end("Not Found"); return}; // undefined
                        if(disk.stat(rp).isDirectory()) // folder
                        {tv=(rp+"/index.html"); if(!disk.exists(tv)){rsp.writeHead(403); rsp.end("Forbidden"); return}; rp=tv};
                        fx=fext(rp);  mt=server.config.mime[fx];  fd=disk.readFile(rp);  rsp.statusCode=200;
                        rsp.setHeader("Content-type",(mt||"text/plain")); rsp.end(fd);
                        return;
                    };
                    rsp.writeHead(405); rsp.end("Method Not Allowed");
                });
                extend(host)({path:path,addr:(addr+""),indx:indx});
                addr=addr.split(":"); if(!addr[1]){addr[1]=2592};
                host.listen(addr[1],addr[0]); herald(host);
                dump(`\nhttp server running .. http://${addr[0]}:${addr[1]}\n`);
                return host;
            },


            select:function select(opt,cbf)
            {
                if(isPath(opt)){opt={using:opt}}; if(!isKnob(opt)){fail("1st arg is invalid"); return};
                if(isFunc(cbf)){opt.yield=cbf}; if(!isFunc(opt.yield)){fail("invalid options/arguments"); return};
                disk.readFile(opt.using,function(rsp,hdr)
                {
                    if(isFunc(opt.apply)){rsp=opt.apply(rsp,hdr);};
                    opt.yield(rsp,hdr);
                });
            },
        }
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: requires : load & run files
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function load()
    {
        var arg,cbf,rsl,dne,thn; arg=args(arguments); cbf=rpop(arg);
        if(!isFunc(cbf)){arg.radd(cbf); cbf=VOID}; // no callback as last arg .. add it back
        rsl=[]; dne=[0,span(arg)];

        thn=function then()
        {
            return this.then.apply(null,args(arguments));
        }.join({then:function then(tfa)
        {
            if(isFunc(tfa)){this.done=tfa; return};
            if(isFunc(this.done)){this.done.apply(this.done,args(arguments))};
        }.join({done:cbf})});

        arg.forEach((pth)=>
        {
            let fun,ext; ext=fext(pathOf(pth));
            fun=function(wut){dne[0]++; rsl.radd(wut||this); if(dne[0]==dne[1]){tick.after(0,()=>{thn.apply(thn,rsl)})}};

            if(SERVERSIDE)
            {
                if(ext=="js"){fun(require(pth)); return};
                if(ext=="json"){fun(decode.jso(disk.readFile(pth))); return};
                fun(disk.readFile(pth)); return;
            };

            if(!render.handle[ext]){fail(`missing handler for "${ext}"`); return STOP};
            let dja=select(`[src="${pth}"]`); if(dja){fun(dja[0]); return};
            render.handle[ext](pth,(rsl)=>
            {
                if(isin("js,css",ext)){HEAD.insert(rsl);};
                fun(rsl);
            });
        });

        return thn;
    });
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: (dom-crud) : CRUD for the DOM .. runs clientSide
// ----------------------------------------------------------------------------------------------------------------------------
    if(CLIENTSIDE)
    {
        hard(function create(obj)
        {
            if(isWord(obj)){return document.createElement(obj)}; // done .. only text given as tag-name
            if(!expect.knob(obj,1)){return}; // validation
            let tmp,tag,def,ext,kds,rsl; tmp=keys(obj); tag=tmp[0]; def=obj[tag]; delete obj[tag]; // tag-name
            if(!isText(def)||(isText(def)&&!def.startsWith("#")&&!def.startsWith("."))){kds=def; def=VOID}; // quick-atr
            ext=isin(tmp,["$","contents","children"]); if(ext){kds=obj[ext]; delete obj[ext]}; // contents
            rsl=document.createElement(tag); if(!def&&!kds&&(span(obj)<1)){return rsl}; // done .. no attributes nor contents

            if(isText(def,2)){def.split(" ").forEach((d)=> // for quick attributes
            {
                let c=d.slice(0,1); d=d.slice(1); if((c=="#")){obj.id=d; obj.name=d}
                else if(c=="."){if(!obj.class){obj.class=""}; obj.class=obj.class.split(" ").radd(d).join(" ").trim()}});
            };

            rsl.modify(obj); if(kds){rsl.insert(kds)};
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
                if(c=='^'){return this.parentNode}; if(c=='^^'){c='^',n=2}; d=["^","<",">"];
                if(c=='<'){return this.previousSibling}; if(c=='>'){return this.nextSibling}; if(!isText(c,1)){return};
                if((c=='<<')||(c=='>>')){r=this.parentNode; return (!r?VOID:((c=='<<')?r.firstElementChild:r.lastElementChild))};
                if(!isin(d,c)||!isInum(n)||(n<1)){return this}; s=rstub(c,d); if(s&&!isNaN(s[2])){n=s[2]}; n=(n*1);
                r=this; w=((c=='^')?'parentNode':((c=='<')?'previousSibling':'nextSibling'));
                while(n){n--; if(!!r[w]){r=r[w]}else{break}}; // find
                return r; // returns found-relative, or self if relative-not-found
            },

            select:function select(def)
            {
                if(!isText(def,1)){return}; let chr,qry,rsl,lst,tmp; chr=def.slice(0,1); qry="querySelectorAll"; rsl=[];
                if(isin("^<>",chr)){return this.lookup(def);}; // parents & siblings
                if(def=="*") // all children .. omit empty `#text` nodes
                {
                    listOf(this.childNodes).forEach((n)=>{if(((n.nodeName!='#text')||n.textContent.trim())){rsl.radd(n)}});
                    return rsl;
                };
                lst=this[qry](`:scope ${def}`);
                if((lst.length<1)&&(chr=='#')&&(def.indexOf(" ")<1)){def=def.slice(1); lst=this[qry](`:scope [name=${def}]`)};
                if(lst.length<1){return}; listOf(lst).forEach((n)=> // fixed querySelector bug
                {
                    if(isin(def,"[value=")){tmp=stub(def,"=")[2]; tmp=unwrap(rstub(tmp,"]")[0]); if(n.value!=tmp){return}};
                    rsl.radd(n);
                });
                if(rsl.length<1){return}; if(chr=="#"){rsl=rsl[0]}; // implied
                return rsl;
            },

            modify:function modify(obj)
            {
                if(!expect.knob(obj)){return}; // validation
                obj.forEach((v,k)=>
                {
                    if(!isFunc(v)&&!isKnob(v)&&(k!='innerHTML')){this.setAttribute(k,v);}; // normal attribute
                    if(k=='class'){k='className'}; // prep attribute name for JS
                    this[k]=v; // set attribute as property -which possibly triggers some intrinsic JS event
                });
                return this;
            },

            insert:function insert(v)
            {
                if(v==VOID){return this}; let t=nodeName(this);
                if(isList(v)){var s=this; listOf(v).forEach((o)=>{s.insert(o)});return s}; // works with nodelist also
                if(t=='img'){return this}; // TODO :: impose?
                if(t=='input'){this.value=text(v); return this}; // form input text
                if(isNode(v)||isTemp(v)){this.appendChild(v); return this}; // normal DOM-node append
                if(isKnob(v)){let n=create(v); if(!isNode(n)){return this}; this.appendChild(n);return this}; //create & append
                if(isText(v)&&(wrapOf(trim(v))=='<>')){this.innerHTML=v; return this}; // insert as html
                if(!isText(v)){v=text(v);}; // convert any non-text to text .. circular, boolean, number, function, etc.
                if(isin(['code','text'],t)){this.textContent=v; return this;}; // insert as TEXT
                if(isin("style,script,pre,span,h1,h2,h3,h4,h5,h6,p,a,i,b",t)){this.innerHTML=v; return this}; // insert as HTML
                let n=create('span'); n.innerHTML=v; this.appendChild(n); return this; // append text as span
            },

            remove:function remove()
            {
                let a=args(arguments); a.forEach((d)=>
                {
                    if(isText(d)){d=this.select(d);}; if(!isList(d)){d=[d]};
                    d.forEach((n)=>{if(!isNode(n)){return}; n.parentNode.removeChild(n)});
                });
                return TRUE;
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
            src=create({div:src}).select("*"); tgt.insert(src); cbf(src);
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
            if(isText(a)){a=select(a)}; if(!isNode(a)){fail('expecting node or #nodeID');return};
            if(!a.parentNode){fail('node is not attached to the DOM .. yet');return};
            let r=decode.jso(encode.jso(a.getBoundingClientRect())); r.forEach((v,k)=>{r[k]=Math.round(v)});
            return r;
        });
    };
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
             this.className=l.join(' ');
          },


          declan:function()
          {
             var c,l,a,x; c=(this.className||'').trim(); l=(c?c.split(' '):[]); a=listOf(arguments);
             a.forEach((i)=>{x=l.indexOf(ltrim(i,'.')); if(x>-1){l.splice(x,1)}}); this.className=l.join(' ');
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
             if(!isText(r,6)||!isin(r,"::")){fail(f);return}; prts=stub(r,"::"); slct=trim(prts[0]);
             prts=stub(trim(prts[2]),":"); if(!slct||!prts){return}; attr=trim(prts[0]); ordr=lowerCase(trim(prts[2]));
             if(!attr||!ordr){return}; slct=this.select(slct); if(!slct){return}; indx={};
             slct.forEach((n)=>{let a=bore(n,attr); if(isVoid(a)){return}; indx[a]=n; remove(n)});
             fltr=(keys(indx)).sort(); if(ordr=="dsc"){fltr.reverse()}; fltr.forEach((i)=>{this.appendChild(indx[i])});
          },
       });
    };
// ----------------------------------------------------------------------------------------------------------------------------




// tool :: device : events
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
                getCombo:function getCombo(how)
                {
                    this.keyCombo=keys(this.vars.btns).join(" ").trim();
                    if((how!=SILENT)&&isin(this.keyCombo," "))
                    {emit("KeyCombo",this.keyCombo); emit(this.keyCombo)};
                    return this.keyCombo;
                },
            },
        });

        MAIN.upon("mousemove",function(e)
        {
            let na,oa,en,be; be="MouseMove"; oa=device.vars.axis; na={x:e.clientX,y:e.clientY}; emit((be+"Any"),na);
            en=((na.x>oa.x)?"Rigt":((na.x<oa.x)?"Left":((na.y>oa.y)?"Down":((na.y<oa.y)?"Up":""))));
            if(!en){return}; en=(be+en); device.vars.axis=na; emit(en,na); device.vars.last="mouse";
            if(device.vars.busy.mouse){clearTimeout(device.vars.busy.mouse)}else{emit(be+"Begin")};
            device.vars.busy.mouse=tick.after(300,()=>
            {delete device.vars.busy.mouse; delete device.vars.btns[en]; emit(be+"End")});
        });

        MAIN.upon("mousedown",function(e)
        {
            let cb,en; cb=((e.which<2)?"Left":((e.which==2)?"Middle":"Right")); device.vars.last="mouse";
            en=(cb+"Click"); device.vars.btns[en]=1; device.getCombo(); emit(en);
        });

        MAIN.upon("mouseup",function(e)
        {
            let cb,en; cb=((e.which<2)?"Left":((e.which==2)?"Middle":"Right")); device.vars.last="mouse";
            en=("MouseUp"+cb); delete device.vars.btns[(cb+"Click")]; device.getCombo(SILENT); emit(en);
        });

        MAIN.upon("keydown",function(e)
        {
            let cb; cb=e.key; if(e.keyCode==91){cb="Meta";}else if(cb==" "){cb="Space"}; device.vars.last="keyboard";
            device.vars.btns[cb]=1; device.getCombo(); emit("KeyDown",cb);
        });

        MAIN.upon("keyup",function(e)
        {
            let cb; cb=e.key; if(e.keyCode==91){cb="Meta";}else if(cb==" "){cb="Space"}; device.vars.last="keyboard";
            delete device.vars.btns[cb]; device.getCombo(); emit("KeyUp",cb);
        });

        MAIN.upon("keypress",function(e)
        {
            let cb; cb=e.key; if(e.keyCode==91){cb="Meta";}else if(cb==" "){cb="Space"}; emit("KeyPress",cb);
            device.vars.last="keyboard"; if(e.repeat){emit("KeyRepeat",cb)};
            if(device.vars.busy.keyboard){clearTimeout(device.vars.busy.keyboard)}else{emit("TypingBegin")};
            device.vars.busy.keyboard=tick.after(500,()=>{delete device.vars.busy.keyboard; emit("TypingEnd")});
        });

        MAIN.upon("contextmenu",function(e)
        {
            if(device.vars.last=="mouse"){e.preventDefault(); return false;};
        });

        MAIN.upon("blur",function(e)
        {
            device.vars.btns={};
        });


        upon("load",()=>
        {
            if(seen("HEAD")){return}; // window.onload was triggered before
            defn({HEAD:document.head, BODY:document.body}); // global shorthands
            emit("ready"); // DOM has fully loaded
        });
    };
// ----------------------------------------------------------------------------------------------------------------------------
