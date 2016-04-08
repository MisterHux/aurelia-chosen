"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var aurelia_templating_1 = require('aurelia-templating');
var aurelia_binding_1 = require('aurelia-binding');
var LogManager = require('aurelia-logging');
var aurelia_dependency_injection_1 = require('aurelia-dependency-injection');
var aurelia_pal_1 = require('aurelia-pal');
require('harvesthq/chosen');
require('harvesthq/chosen/chosen.min.css!');
var $ = require('jquery');
var _ = require('lodash');
var ChosenSelect = (function () {
    function ChosenSelect(element, engine) {
        var _this = this;
        this.id = '';
        this.name = '';
        this.label = '';
        this.options = new Array();
        this.value = null;
        this.placeholder = "";
        this.readonly = false;
        this.inlineForm = false;
        this.disabled = false;
        this.multiple = false;
        this.noLabel = false;
        this.valueProperty = "id";
        this.displayProperty = "name";
        this.disabledProperty = "isDisabled";
        this.helpText = "";
        this.logger = LogManager.getLogger("chosen");
        this._clear = false;
        this._multiple = false;
        this._chosenOptions = undefined;
        this._chosenDefaults = undefined;
        this.changeChosenPlaceholderText = function (placeholder, placeholder_single, placeholder_multiple) {
            if (_this._chosenObject !== undefined || _this._chosenObject !== null) {
                var chosenData = _this._chosenObject.data("chosen");
                chosenData.default_text = placeholder;
                chosenData.options.placeholder_text_multiple = placeholder_single;
                chosenData.options.placeholder_text_single = placeholder_multiple;
                if (_this._multiple === false) {
                    $("span", _.head(chosenData.selected_item)).text(placeholder);
                }
                else {
                    var input = _.head(chosenData.search_field);
                    input.value = placeholder;
                    input.defaultValue = placeholder;
                }
            }
        };
        this.someOptionsChanged = function (splices) {
            _this.logger.debug('someOptionsChanged');
            if (_this._chosenObject !== undefined) {
                setTimeout(function () {
                    _this._chosenObject.trigger("liszt:updated");
                    ;
                    _this._chosenObject.trigger("chosen:updated");
                }, 100);
            }
        };
        this.isTruthy = function (b) {
            return (/^(true|yes|1|y|on)$/i).test(b);
        };
        this.onSelectionChangeEvent = function (event) {
            var changeEvent;
            var newValue = $(_this._select).val();
            var valueObjects = _.filter(_this.options, function (option) {
                return newValue && newValue.indexOf(option[_this.valueProperty]) >= 0;
            });
            if (_this._multiple === false) {
                valueObjects = _.head(valueObjects);
            }
            _this.value = valueObjects;
            if (window["CustomEvent"] !== undefined) {
                changeEvent = new CustomEvent('change', { detail: { value: valueObjects }, bubbles: true });
            }
            else {
                changeEvent = document.createEvent('CustomEvent');
                changeEvent.initCustomEvent('change', true, true, { value: valueObjects });
            }
            _this._element.dispatchEvent(changeEvent);
        };
        this._element = element;
        this._bindingEngine = engine;
        if (!this.id && this.name) {
            this.id = this.name;
        }
        if (!this.name && this.id) {
            this.name = this.id;
        }
        this.disabled = this._element.hasAttribute('disabled') || this.isTruthy(this.disabled);
        this.readonly = this._element.hasAttribute('readonly') || this.isTruthy(this.readonly);
        this.inlineForm = this._element.hasAttribute('inlineForm') || this.isTruthy(this.inlineForm);
        this._multiple = this._element.hasAttribute('multiple') || this.isTruthy(this.multiple);
        this._clear = this._element.hasAttribute('clear');
        this._chosenDefaults = {
            no_results_text: "Oops, nothing found!",
            width: "100%",
            search_contains: false,
            disable_search_threshold: 10,
            allow_single_deselect: this._clear,
            placeholder_text_single: this.placeholder,
            placeholder_text_multiple: this.placeholder
        };
        this._chosenOptions = this.parseChosenOptions(this._chosenDefaults);
    }
    ChosenSelect.prototype.bind = function () {
        this.logger.debug('bind');
        if (this.value !== null && this.value !== undefined) {
            this.valueChanged(this.value);
        }
        if (this.chosenOptions !== undefined && this.chosenOptions !== '') {
            var passedOptions = this.parseChosenOptions(this.chosenOptions);
            _.extend(this._chosenOptions, passedOptions);
        }
    };
    ChosenSelect.prototype.attached = function () {
        var _this = this;
        this.logger.debug('attached');
        var jQuerySelect = $(this._select);
        if (this.value !== undefined) {
            jQuerySelect.val(this.value[this.valueProperty]);
        }
        if (this.readonly === true) {
            jQuerySelect.attr("readonly", "readonly");
        }
        if (this.disabled === true) {
            jQuerySelect.attr("disabled", "disabled");
        }
        jQuerySelect.attr(this._multiple ? "multiple" : "single", "");
        this._chosenObject = jQuerySelect.chosen(this.parseChosenOptions(this._chosenOptions));
        this._chosenObject.change(function (event) {
            _this.onSelectionChangeEvent(event);
        });
        if (this.options !== undefined) {
            this._optionsSubscription = this._bindingEngine.collectionObserver(this.options).subscribe(function (splices) { return _this.someOptionsChanged(splices); });
        }
        else {
            var waitingText = 'Please wait, gathering values';
            this.changeChosenPlaceholderText(waitingText, waitingText, waitingText);
            this._chosenObject.attr("disabled", "disabled");
            this._chosenObject.trigger("liszt:updated");
            this._chosenObject.trigger("chosen:updated");
        }
    };
    ChosenSelect.prototype.valueChanged = function (newValue) {
        var _this = this;
        this.logger.debug('valueChanged');
        if (this._chosenObject !== undefined && this._multiple) {
            setTimeout(function () {
                _this._chosenObject.trigger("liszt:updated");
                ;
                _this._chosenObject.trigger("chosen:updated");
            }, 100);
        }
    };
    ChosenSelect.prototype.optionsChanged = function () {
        var _this = this;
        this.logger.debug('optionsChanged');
        this._optionsSubscription = this._bindingEngine.collectionObserver(this.options).subscribe(function (splices) { return _this.someOptionsChanged(splices); });
        if (this._chosenObject !== undefined) {
            if (this.disabled === false) {
                this._chosenObject.removeAttr("disabled");
            }
            var selectedItemText = this.placeholder !== "" ? this.placeholder : "Select an Option";
            this.changeChosenPlaceholderText(selectedItemText, this._chosenOptions.placeholder_text_single, this._chosenOptions.placeholder_text_multiple);
            setTimeout(function () {
                _this._chosenObject.trigger("liszt:updated");
                ;
                _this._chosenObject.trigger("chosen:updated");
            }, 100);
        }
    };
    ChosenSelect.prototype.detached = function () {
        this.logger.debug('detached');
        this._optionsSubscription.dispose();
        this._chosenObject.chosen('destroy').off('change');
    };
    ChosenSelect.prototype.parseChosenOptions = function (options) {
        var chosenOptions = {};
        var parsedData;
        if (typeof options === "string") {
            try {
                parsedData = JSON.parse(options);
            }
            catch (exception) {
                var fixedJson = options.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
                parsedData = JSON.parse("{" + fixedJson + "}");
            }
        }
        else {
            parsedData = options;
        }
        Object.assign(chosenOptions, parsedData);
        return chosenOptions;
    };
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "id", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "name", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "label", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Array)
    ], ChosenSelect.prototype, "options", void 0);
    __decorate([
        aurelia_templating_1.bindable({ defaultBindingMode: aurelia_binding_1.bindingMode.twoWay }), 
        __metadata('design:type', Object)
    ], ChosenSelect.prototype, "value", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "placeholder", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Boolean)
    ], ChosenSelect.prototype, "readonly", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Boolean)
    ], ChosenSelect.prototype, "inlineForm", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Boolean)
    ], ChosenSelect.prototype, "disabled", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Boolean)
    ], ChosenSelect.prototype, "multiple", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Boolean)
    ], ChosenSelect.prototype, "noLabel", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "valueProperty", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "displayProperty", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "disabledProperty", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "helpText", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "chosenOptions", void 0);
    ChosenSelect = __decorate([
        aurelia_templating_1.customElement('chosen'),
        aurelia_dependency_injection_1.inject(aurelia_pal_1.DOM.Element, aurelia_binding_1.BindingEngine), 
        __metadata('design:paramtypes', [HTMLElement, aurelia_binding_1.BindingEngine])
    ], ChosenSelect);
    return ChosenSelect;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChosenSelect;
//# sourceMappingURL=chosen-select.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hvc2VuL2Nob3Nlbi1zZWxlY3QuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiY2hvc2VuL2Nob3Nlbi1zZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1DQUF3QyxvQkFBb0IsQ0FBQyxDQUFBO0FBQzdELGdDQUEyQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzdELElBQVksVUFBVSxXQUFNLGlCQUFpQixDQUFDLENBQUE7QUFDOUMsNkNBQXVCLDhCQUE4QixDQUFDLENBQUE7QUFDdEQsNEJBQWtCLGFBQWEsQ0FBQyxDQUFBO0FBRWhDLFFBQU8sa0JBQWtCLENBQUMsQ0FBQTtBQUMxQixRQUFPLGtDQUFrQyxDQUFDLENBQUE7QUFFMUMsSUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDNUIsSUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFJNUI7SUEwQ0Usc0JBQVksT0FBb0IsRUFBRSxNQUFzQjtRQTFDMUQsaUJBeU9DO1FBeE9rQixPQUFFLEdBQVksRUFBRSxDQUFDO1FBQ2pCLFNBQUksR0FBWSxFQUFFLENBQUM7UUFDbkIsVUFBSyxHQUFZLEVBQUUsQ0FBQztRQUdwQixZQUFPLEdBQW1CLElBQUksS0FBSyxFQUFVLENBQUM7UUFHeEQsVUFBSyxHQUE0QixJQUFJLENBQUM7UUFHNUIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFFekIsYUFBUSxHQUFhLEtBQUssQ0FBQztRQUUzQixlQUFVLEdBQWEsS0FBSyxDQUFDO1FBQzdCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIsYUFBUSxHQUFhLEtBQUssQ0FBQztRQUMzQixZQUFPLEdBQWEsS0FBSyxDQUFDO1FBQzFCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBQzlCLG9CQUFlLEdBQVksTUFBTSxDQUFDO1FBQ2xDLHFCQUFnQixHQUFZLFlBQVksQ0FBQztRQUN6QyxhQUFRLEdBQVksRUFBRSxDQUFDO1FBR2hDLFdBQU0sR0FBRyxVQUFVLENB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
