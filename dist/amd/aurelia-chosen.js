define(["require", "exports"], function (require, exports) {
    "use strict";
    function configure(aurelia) {
        aurelia.globalResources([
            './chosen/chosen-select'
        ]);
    }
    exports.configure = configure;
});
