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
        return true; // all is well
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
    hard(function moan() {let a=([].slice.call(arguments)); a.unshift("\x1b[31m%s\x1b[0m"); console.error.apply(console,a)});
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: (flags) : to use everywhere .. mostly for shorthand, flags, syntax-sugar
// ----------------------------------------------------------------------------------------------------------------------------
    defn("A B C D E F G H I J K L M N O P Q R S T U V W X Y Z");
    defn("OK NA TL TM TR RT RM RB BR BM BL LB LM LT MM");
    defn("ANY ALL");
    defn("INIT AUTO COOL DARK LITE INFO GOOD NEED WARN FAIL NEXT SKIP STOP DONE ACTV NONE BUSY KEYS VALS ONCE EVRY BFOR AFTR");
    defn("UNTL EVNT FILL TILE SPAN OPEN SHUT SELF VERT HORZ");
// ----------------------------------------------------------------------------------------------------------------------------



// func :: span : length of anything .. spanIs -to verify/assert span
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function span(d,x)
    {
        if((d===NULL)||(d===VOID)||(!d&&isNaN(d))){return 0};  if(!isNaN(d)){d=(d+"")};
        if(x&&((typeof x)=="string")&&((typeof d)=="string")){d=(d.split(x).length-1); return d};
        let s=d.length; if(!isNaN(s)){return s;}; try{s=Object.getOwnPropertyNames(d).length; return s;}catch(e){return 0;}
    });

    hard(function spanIs(d,g,l){let s=(((typeof d)=='number')?d:span(d)); g=(g||0); l=(l||s); return ((s>=g)&&(s<=l))});
// ----------------------------------------------------------------------------------------------------------------------------



// shiv :: (types) : shorthands to identify variables .. g & l is "greater-than" & "less-than" -which counts items inside v
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function isVoid(v){return ((v===VOID)||(v===null))});
    hard(function isBool(v){return ((v===TRUE)||(v===FALS))});
    hard(function isNumr(v,g,l){if(!((typeof v)==='number')||isNaN(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))});
    hard(function isText(v,g,l){if(!((typeof v)==='string')){return FALS}; return (isVoid(g)||spanIs(v,g,l))});

    hard(function isList(v,g,l)
    {
        let t=Object.prototype.toString.call(v).toLowerCase();
        if((t.indexOf('arra')<0)&&(t.indexOf('argu')<0)&&(t.indexOf('list')<0)&&(t.indexOf('coll')<0)){return FALS};
        return (isVoid(g)||spanIs(v,g,l))
    });

    hard(function isKnob(v,g,l)
    {if(((typeof v)!='object')||isList(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))});

    hard(function isFunc(v,g,l){if(!((typeof v)==='function')){return FALS}; return true});
// ----------------------------------------------------------------------------------------------------------------------------




// func :: what : concise `typeof` .. returns 4-letter word, or undefined
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function what(v)
    {
        let l=("Void,Bool,Numr,Text,List,Knob,Func").split(",");
        for(let i in l){if(!l.hasOwnProperty(i)){continue}; if(MAIN[`is${l[i]}`](v)){return l[i].toLowerCase()}};
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: keys/vals : return a list of own-keys, or own-values of an object .. returns empty array on fail
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function keys(o,x)
    {
        if(!isKnob(o)&&!isList(o)&&!isFunc(o)){return []}; // validation .. array is expected as return value
        let r=Object.getOwnPropertyNames(o); if(!isNumr(x)){return r}; // get properties .. return all
        if(x<0){x=((r.length-1)+x)}; return r[x];
    });

    hard(function vals(o,x)
    {
      let r=[]; keys(d).forEach((k)=>{r.push(d[k])});
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
    hard(function mean(v)
    {
        if(!isText(v,1)){return};  let t=v.trim();  if(!t){return v}; // obvious stuff out the way
        try{let r=JSON.parse(t); return r}catch(e){}; // most of the heavy lifting
        return v; // unchanged
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: text : parse meaning into text
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function text(v,w)
    {
        if((v===VOID)||isFunc(v)||isText(v)){return (v+"")};
        return JSON.stringify(v);
    });
// ----------------------------------------------------------------------------------------------------------------------------




// func :: stak : get call-stack .. returns array of text (per stack-item) should be compatible with all modern platforms
// ----------------------------------------------------------------------------------------------------------------------------
    hard(function stak(x,a, e,s,r,h,o)
    {
        a=(a||""); e=(new Error(".")); s=e.stack.split("\n"); s.shift();
        r=[]; h="{:HOSTPURL:}"; o=["_fake_"];
        s.forEach((i)=>
        {
            if((h!=("{"+":HOSTPURL:"+"}"))&&(i.indexOf(h)<0)){return}; // security
            let p,c,f,l,q; q=1; p=i.trim().split(h);
            c=p[0].split("@").join("").split("at ").join("").trim(); c=c.split(" ")[0]; if(!c){c="anon"};
            o.forEach((y)=>{if(((c.indexOf(y)==0)||(c.indexOf("."+y)>0))&&(a.indexOf(y)<0)){q=0}}); if(!q){return};
            p=p[1].split(" "); f=p[0]; if(f.indexOf(":")>0){p=f.split(":"); f=p[0]}else{p=p.pop().split(":")};
            if(f=="/"){return}; l=p[1]; r[r.length]=([c,f,l]).join(" ");
        });
        if(!isNaN(x*1)){return r[x]}; return r;
    });
// ----------------------------------------------------------------------------------------------------------------------------

dump(stak());
