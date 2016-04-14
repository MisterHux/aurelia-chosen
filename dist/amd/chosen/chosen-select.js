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
            this.valueProperty = "id";
            this.displayProperty = "name";
            this.disabledProperty = "isDisabled";
            this.groupProperty = "optGroup";
            this.optgroup = false;
            this.helpText = "";
            this.logger = LogManager.getLogger("chosen");
            this._clear = false;
            this._noLabel = false;
            this._noHelpText = false;
            this._multiple = false;
            this._optGroup = false;
            this._chosenOptions = undefined;
            this._chosenDefaults = undefined;
            this.optionGroups = new Array();
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
            this.triggerChosenReDraw = function (delay) {
                if (delay === void 0) { delay = 100; }
                setTimeout(function () {
                    _this._chosenObject.trigger("liszt:updated");
                    _this._chosenObject.trigger("chosen:updated");
                }, delay);
            };
            this.someOptionsChanged = function (splices) {
                _this.logger.debug('someOptionsChanged');
                if (_this._chosenObject !== undefined) {
                    _this.triggerChosenReDraw();
                }
            };
            this.parseChosenOptions = function (options) {
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
            this.isTruthy = function (toTest) {
                return (/^(true|yes|1|y|on)$/i).test(toTest);
            };
            this.isNullOrEmpty = function (toTest) {
                return ((toTest === undefined) || (toTest === null) || (toTest === ''));
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
        }
        ChosenSelect.prototype.bind = function (bindingContext, overrideContext) {
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
            this._noHelpText = this.helpText === '';
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
            }
            else {
                this.optionGroups = this.options;
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
                this.triggerChosenReDraw(10);
            }
        };
        ChosenSelect.prototype.detached = function () {
            this.logger.debug('detached');
            this._optionsSubscription.dispose();
            this._chosenObject.chosen('destroy').off('change');
        };
        ChosenSelect.prototype.valueChanged = function (newValue, oldValue) {
            this.logger.debug('valueChanged');
            if (this._chosenObject !== undefined && this._multiple) {
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.readonlyChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.logger.debug('readonlyChanged');
                if (newValue === true) {
                    this._chosenObject.attr("readonly", true);
                }
                else {
                    this._chosenObject.removeAttr("readonly");
                }
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.disabledChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.logger.debug('disabledChanged');
                if (newValue === true) {
                    this._chosenObject.attr("disabled", true);
                }
                else {
                    this._chosenObject.removeAttr("disabled");
                }
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.displayPropertyChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.valuePropertyChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.disabledPropertyChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.groupPropertyChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (this._optGroup) {
                    this.optionGroups = _.uniq(_.map(this.options, this.groupProperty));
                }
                else {
                    this.optionGroups = this.options;
                }
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.optgroupChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this._optGroup = newValue;
                if ((this._optGroup) && (this.isNullOrEmpty(this.groupProperty) === false)) {
                    this.optionGroups = _.uniq(_.map(this.options, this.groupProperty));
                }
                else {
                    this.optionGroups = this.options;
                }
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.omultipleChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this._multiple = newValue;
                this.triggerChosenReDraw();
            }
        };
        ChosenSelect.prototype.placeholderChanged = function (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.changeChosenPlaceholderText(newValue, newValue, newValue);
                this.triggerChosenReDraw();
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
                this.triggerChosenReDraw();
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
        return ChosenSelect;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ChosenSelect;
    var FilterOnPropertyValueConverter = (function () {
        function FilterOnPropertyValueConverter() {
        }
        FilterOnPropertyValueConverter.prototype.toView = function (array, property, exp) {
            if (array === undefined || array === null || property === undefined || exp === undefined) {
                return array;
            }
            if (exp.startsWith("!")) {
                return array.filter(function (item) {
                    var itemProp = item[property];
                    var returnValue = (itemProp !== undefined && itemProp !== null) === false;
                    return returnValue;
                });
            }
            else {
                return array.filter(function (item) {
                    var itemProp = item[property];
                    var returnValue = false;
                    if (itemProp !== undefined && itemProp !== null) {
                        returnValue = item[property].toLowerCase() === exp.toLocaleLowerCase();
                    }
                    return returnValue;
                });
            }
        };
        return FilterOnPropertyValueConverter;
    }());
    exports.FilterOnPropertyValueConverter = FilterOnPropertyValueConverter;
});
