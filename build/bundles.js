module.exports = {
  "bundles": {
    "dist/app-build": {
      "includes": [
        "[**/*.js]",
        "**/*.html!text",
        "**/*.css!text"
      ],
      
      "options": {
        "inject": true,
        "minify": true,
        "depCache": true,
        "rev": true
      }
    },
    "dist/third-party": {
      "includes": [
        "harvesthq/chosen",
        "jquery",
        "lodash",
        "font-awesome",
        "text",
        "bootstrap",
        "fetch",
        "harvesthq/chosen/chosen.min.css!text",
        "bootstrap/css/bootstrap.css!text"
      ],
      "options": {
        "inject": true,
        "minify": true,
        "depCache": true,
        "rev": true
      }
    },
    "dist/aurelia": {
      "includes": [
        "aurelia-animator-css",
        "aurelia-framework",
        "aurelia-bootstrapper",
        "aurelia-fetch-client",
        "aurelia-router",
        "aurelia-pal",
        "aurelia-pal-browser",
        "aurelia-animator-css",
        "aurelia-templating-binding",
        "aurelia-logging",
        "aurelia-path",
        "aurelia-metadata",
        "aurelia-task-queue",
        "aurelia-loader",
        "aurelia-binding",
        "aurelia-polyfills",
        "aurelia-templating",
        "aurelia-templating-resources",
        "aurelia-templating-router",
        "aurelia-loader-default",
        "aurelia-history-browser",
        "aurelia-logging-console"
      ],
      "options": {
        "inject": true,
        "minify": true,
        "depCache": true,
        "rev": true
      }
    }
  }
};
