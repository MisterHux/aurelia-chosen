var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", 'aurelia-templating', 'aurelia-binding', 'aurelia-logging', 'aurelia-dependency-injection', 'aurelia-pal', 'jquery', 'lodash', 'harvesthq/chosen', 'harvesthq/chosen/chosen.min.css!'], function (require, exports, aurelia_templating_1, aurelia_binding_1, LogManager, aurelia_dependency_injection_1, aurelia_pal_1, $, _) {
    "use strict";
    let ChosenSelect = class ChosenSelect {
        constructor(element, engine) {
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
            this.valueProperty = "id";
            this.displayProperty = "name";
            this.disabledProperty = "isDisabled";
            this.groupProperty = "optGroup";
            this.optgroup = false;
            this.helpText = "";
            this.logger = LogManager.getLogger("chosen");
            this._clear = false;
            this._noLabel = false;
            this._multiple = false;
            this._optGroup = false;
            this._chosenOptions = undefined;
            this._chosenDefaults = undefined;
            this.optionGroups = new Array();
            this.changeChosenPlaceholderText = (placeholder, placeholder_single, placeholder_multiple) => {
                if (this._chosenObject !== undefined || this._chosenObject !== null) {
                    var chosenData = this._chosenObject.data("chosen");
                    chosenData.default_text = placeholder;
                    chosenData.options.placeholder_text_multiple = placeholder_single;
                    chosenData.options.placeholder_text_single = placeholder_multiple;
                    if (this._multiple === false) {
                        $("span", _.head(chosenData.selected_item)).text(placeholder);
                    }
                    else {
                        var input = _.head(chosenData.search_field);
                        input.value = placeholder;
                        input.defaultValue = placeholder;
                    }
                }
            };
            this.someOptionsChanged = (splices) => {
                this.logger.debug('someOptionsChanged');
                if (this._chosenObject !== undefined) {
                    setTimeout(() => {
                        this._chosenObject.trigger("liszt:updated");
                        ;
                        this._chosenObject.trigger("chosen:updated");
                    }, 100);
                }
            };
            this.isTruthy = function (b) {
                return (/^(true|yes|1|y|on)$/i).test(b);
            };
            this.onSelectionChangeEvent = (event) => {
                let changeEvent;
                let newValue = $(this._select).val();
                let valueObjects = _.filter(this.options, (option) => {
                    return newValue && newValue.indexOf(option[this.valueProperty]) >= 0;
                });
                if (this._multiple === false) {
                    valueObjects = _.head(valueObjects);
                }
                this.value = valueObjects;
                if (window["CustomEvent"] !== undefined) {
                    changeEvent = new CustomEvent('change', { detail: { value: valueObjects }, bubbles: true });
                }
                else {
                    changeEvent = document.createEvent('CustomEvent');
                    changeEvent.initCustomEvent('change', true, true, { value: valueObjects });
                }
                this._element.dispatchEvent(changeEvent);
            };
            this._element = element;
            this._bindingEngine = engine;
            if (!this.id && this.name) {
                this.id = this.name;
            }
            if (!this.name && this.id) {
                this.name = this.id;
            }
        }
        bind(bindingContext, overrideContext) {
            this.logger.debug('bind');
            this._bindingContext = bindingContext;
            this._overrideContext = overrideContext;
            this.disabled = this._element.hasAttribute('disabled') || this.isTruthy(this.disabled);
            this.readonly = this._element.hasAttribute('readonly') || this.isTruthy(this.readonly);
            this.inlineForm = this._element.hasAttribute('inlineForm') || this.isTruthy(this.inlineForm);
            this._multiple = this._element.hasAttribute('multiple') || this.isTruthy(this.multiple);
            this._optGroup = this._element.hasAttribute('optgroup') || this.isTruthy(this.optgroup);
            this._clear = this._element.hasAttribute('clear');
            this._noLabel = this._element.hasAttribute('noLabel');
            if (this._noLabel === true) {
                this._noLabel = this.label === '';
            }
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
            if (this.value !== null && this.value !== undefined) {
                this.valueChanged(this.value);
            }
            if (this.chosenOptions !== undefined && this.chosenOptions !== '') {
                var passedOptions = this.parseChosenOptions(this.chosenOptions);
                _.extend(this._chosenOptions, passedOptions);
            }
            if (this._optGroup) {
                this.optionGroups = _.uniq(_.map(this.options, this.groupProperty));
                this.optionGroups;
            }
            else {
                this.optionGroups = this.options;
            }
        }
        attached() {
            this.logger.debug('attached');
            let jQuerySelect = $(this._select);
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
            this._chosenObject.change((event) => {
                this.onSelectionChangeEvent(event);
            });
            if (this.options !== undefined) {
                this._optionsSubscription = this._bindingEngine.collectionObserver(this.options).subscribe(splices => this.someOptionsChanged(splices));
            }
            else {
                var waitingText = 'Please wait, gathering values';
                this.changeChosenPlaceholderText(waitingText, waitingText, waitingText);
                this._chosenObject.attr("disabled", "disabled");
                this._chosenObject.trigger("liszt:updated");
                this._chosenObject.trigger("chosen:updated");
            }
        }
        valueChanged(newValue) {
            this.logger.debug('valueChanged');
            if (this._chosenObject !== undefined && this._multiple) {
                setTimeout(() => {
                    this._chosenObject.trigger("liszt:updated");
                    ;
                    this._chosenObject.trigger("chosen:updated");
                }, 100);
            }
        }
        optionsChanged() {
            this.logger.debug('optionsChanged');
            this._optionsSubscription = this._bindingEngine.collectionObserver(this.options).subscribe(splices => this.someOptionsChanged(splices));
            if (this._chosenObject !== undefined) {
                if (this.disabled === false) {
                    this._chosenObject.removeAttr("disabled");
                }
                var selectedItemText = this.placeholder !== "" ? this.placeholder : "Select an Option";
                this.changeChosenPlaceholderText(selectedItemText, this._chosenOptions.placeholder_text_single, this._chosenOptions.placeholder_text_multiple);
                setTimeout(() => {
                    this._chosenObject.trigger("liszt:updated");
                    ;
                    this._chosenObject.trigger("chosen:updated");
                }, 100);
            }
        }
        detached() {
            this.logger.debug('detached');
            this._optionsSubscription.dispose();
            this._chosenObject.chosen('destroy').off('change');
        }
        parseChosenOptions(options) {
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
        }
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
    ], ChosenSelect.prototype, "groupProperty", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Boolean)
    ], ChosenSelect.prototype, "optgroup", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "helpText", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', String)
    ], ChosenSelect.prototype, "chosenOptions", void 0);
    __decorate([
        aurelia_templating_1.bindable, 
        __metadata('design:type', Array)
    ], ChosenSelect.prototype, "optionGroups", void 0);
    ChosenSelect = __decorate([
        aurelia_templating_1.customElement('chosen'),
        aurelia_dependency_injection_1.inject(aurelia_pal_1.DOM.Element, aurelia_binding_1.BindingEngine), 
        __metadata('design:paramtypes', [HTMLElement, aurelia_binding_1.BindingEngine])
    ], ChosenSelect);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ChosenSelect;
    class FilterOnPropertyValueConverter {
        toView(array, property, exp) {
            if (array === undefined || array === null || property === undefined || exp === undefined) {
                return array;
            }
            if (exp.startsWith("!")) {
                return array.filter((item) => {
                    let itemProp = item[property];
                    let returnValue = (itemProp !== undefined && itemProp !== null) === false;
                    return returnValue;
                });
            }
            else {
                return array.filter((item) => {
                    let itemProp = item[property];
                    let returnValue = false;
                    if (itemProp !== undefined && itemProp !== null) {
                        returnValue = item[property].toLowerCase() === exp.toLocaleLowerCase();
                    }
                    return returnValue;
                });
            }
        }
    }
    exports.FilterOnPropertyValueConverter = FilterOnPropertyValueConverter;
});
