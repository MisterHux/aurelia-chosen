System.register(['aurelia-templating', 'aurelia-binding', 'aurelia-logging', 'aurelia-dependency-injection', 'aurelia-pal', 'harvesthq/chosen', 'harvesthq/chosen/chosen.min.css!text', 'jquery', 'lodash'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var aurelia_templating_1, aurelia_binding_1, LogManager, aurelia_dependency_injection_1, aurelia_pal_1, $, _;
    var ChosenSelect;
    return {
        setters:[
            function (aurelia_templating_1_1) {
                aurelia_templating_1 = aurelia_templating_1_1;
            },
            function (aurelia_binding_1_1) {
                aurelia_binding_1 = aurelia_binding_1_1;
            },
            function (LogManager_1) {
                LogManager = LogManager_1;
            },
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            },
            function (_1) {},
            function (_2) {},
            function ($_1) {
                $ = $_1;
            },
            function (_3) {
                _ = _3;
            }],
        execute: function() {
            ChosenSelect = (function () {
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
            exports_1("default", ChosenSelect);
        }
    }
});
//# sourceMappingURL=chosen-select.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hvc2VuL2Nob3Nlbi1zZWxlY3QuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiY2hvc2VuL2Nob3Nlbi1zZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWFBO2dCQTBDRSxzQkFBWSxPQUFvQixFQUFFLE1BQXNCO29CQTFDMUQsaUJBeU9DO29CQXhPa0IsT0FBRSxHQUFZLEVBQUUsQ0FBQztvQkFDakIsU0FBSSxHQUFZLEVBQUUsQ0FBQztvQkFDbkIsVUFBSyxHQUFZLEVBQUUsQ0FBQztvQkFHcEIsWUFBTyxHQUFtQixJQUFJLEtBQUssRUFBVSxDQUFDO29CQUd4RCxVQUFLLEdBQTRCLElBQUksQ0FBQztvQkFHNUIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7b0JBRXpCLGFBQVEsR0FBYSxLQUFLLENBQUM7b0JBRTNCLGVBQVUsR0FBYSxLQUFLLENBQUM7b0JBQzdCLGFBQVEsR0FBWSxLQUFLLENBQUM7b0JBRTFCLGFBQVEsR0FBYSxLQUFLLENBQUM7b0JBQzNCLFlBQU8sR0FBYSxLQUFLLENBQUM7b0JBQzFCLGtCQUFhLEdBQVksSUFBSSxDQUFDO29CQUM5QixvQkFBZSxHQUFZLE1BQU0sQ0FBQztvQkFDbEMscUJBQWdCLEdBQVksWUFBWSxDQUFDO29CQUN6QyxhQUFRLEdBQVksRUFBRSxDQUFDO29CQUdoQyxXQUFNLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBRTtvQkFTekMsV0FBTSxHQUFhLEtBQUssQ0FBQztvQkFDekIsY0FBUyxHQUFhLEtBQUssQ0FBQztvQkFDNUIsbUJBQWMsR0FBbUIsU0FBUyxDQUFDO29CQUUzQyxvQkFBZSxHQUFtQixTQUFTLENBQUM7b0JBbUg1QyxnQ0FBMkIsR0FBRyxVQUFDLFdBQW1CLEVBQUUsa0JBQTBCLEVBQUUsb0JBQTRCO3dCQUNsSCxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsYUFBYSxLQUFL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
