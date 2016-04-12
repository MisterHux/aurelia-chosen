System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia) {
        aurelia.globalResources([
            './chosen/chosen-select'
        ]);
    }
    exports_1("configure", configure);
    return {
        setters:[],
        execute: function() {
        }
    }
});
