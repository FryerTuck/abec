
// func :: bake : define immutable property
// ----------------------------------------------------------------------------------------------------------------------------
    const bake = function(p,v,o)
    {
        if(!o){o=(((typeof global)!="undefined")?global:window)};
        if(((typeof p)!="string")){throw "invalid proprty";return};
        if(!o.hasOwnProperty){throw "invalid parent";return};
        if(v===(function(){}())){v=o[p]};
        Object.defineProperty(o,p,{writable:false,enumerable:false,configurable:false,value:v});
    };

    bake(`bake`,bake);
// ----------------------------------------------------------------------------------------------------------------------------




// defn :: (global constants) : to use everywhere
// ----------------------------------------------------------------------------------------------------------------------------
    bake(`MAIN`,(((typeof global)!="undefined")?global:window));
    bake(`VOID`,(function(){}()));
    bake(`NULL`,null);
    bake(`TRUE`,(!0));
    bake(`FALS`,(!1));
// ----------------------------------------------------------------------------------------------------------------------------




// func :: dump : console.log
// ----------------------------------------------------------------------------------------------------------------------------
    bake(`dump`,function(){console.log.apply(console,([].slice.call(arguments)))});
// ----------------------------------------------------------------------------------------------------------------------------
