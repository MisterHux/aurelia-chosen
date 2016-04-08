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
                bind() {
                    this.logger.debug('bind');
                    if (this.value !== null && this.value !== undefined) {
                        this.valueChanged(this.value);
                    }
                    if (this.chosenOptions !== undefined && this.chosenOptions !== '') {
                        var passedOptions = this.parseChosenOptions(this.chosenOptions);
                        _.extend(this._chosenOptions, passedOptions);
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
            exports_1("default", ChosenSelect);
        }
    }
});
//# sourceMappingURL=chosen-select.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hvc2VuL2Nob3Nlbi1zZWxlY3QuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiY2hvc2VuL2Nob3Nlbi1zZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWFBO2dCQTBDRSxZQUFZLE9BQW9CLEVBQUUsTUFBc0I7b0JBekN2QyxPQUFFLEdBQVksRUFBRSxDQUFDO29CQUNqQixTQUFJLEdBQVksRUFBRSxDQUFDO29CQUNuQixVQUFLLEdBQVksRUFBRSxDQUFDO29CQUdwQixZQUFPLEdBQW1CLElBQUksS0FBSyxFQUFVLENBQUM7b0JBR3hELFVBQUssR0FBNEIsSUFBSSxDQUFDO29CQUc1QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztvQkFFekIsYUFBUSxHQUFhLEtBQUssQ0FBQztvQkFFM0IsZUFBVSxHQUFhLEtBQUssQ0FBQztvQkFDN0IsYUFBUSxHQUFZLEtBQUssQ0FBQztvQkFFMUIsYUFBUSxHQUFhLEtBQUssQ0FBQztvQkFDM0IsWUFBTyxHQUFhLEtBQUssQ0FBQztvQkFDMUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7b0JBQzlCLG9CQUFlLEdBQVksTUFBTSxDQUFDO29CQUNsQyxxQkFBZ0IsR0FBWSxZQUFZLENBQUM7b0JBQ3pDLGFBQVEsR0FBWSxFQUFFLENBQUM7b0JBR2hDLFdBQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFFO29CQVN6QyxXQUFNLEdBQWEsS0FBSyxDQUFDO29CQUN6QixjQUFTLEdBQWEsS0FBSyxDQUFDO29CQUM1QixtQkFBYyxHQUFtQixTQUFTLENBQUM7b0JBRTNDLG9CQUFlLEdBQW1CLFNBQVMsQ0FBQztvQkFtSDVDLGdDQUEyQixHQUFHLENBQUMsV0FBbUIsRUFBRSxrQkFBMEIsRUFBRSxvQkFBNEI7d0JBQ2xILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQ25ELFVBQVUsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDOzRCQUN0QyxVQUFVLENBQUMsT0FBTyxDQUFDLHlCQUF5QixHQUFHLGtCQUFrQixDQUFDOzRCQUNsRSxVQUFVLENBQUMsT0FBTyxDQUFDLHVCQUF1QixHQUFHLG9CQUFvQixDQUFDOzRCQUNsRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0NBQzdCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQ2hFLENBQUM7NEJBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ04sSUFBSSxLQUFLLEdBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7Z0NBQ2pELEtBQUssQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO2dDQUMxQixLQUFLLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzs0QkFDbkMsQ0FBQzt3QkFDSCxDQUFDO29CQUNILENBQUMsQ0FBQTtvQkFFTyx1QkFBa0IsR0FBRyxDQUFDLE9BQVk7d0JBR3hDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7d0JBRXhDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQzs0QkFDckMsVUFBVSxDQUFDO2dDQUNULElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dDQUFBLENBQUM7Z0NBQzdDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7NEJBQy9DLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDVixDQUFDO29CQUNILENBQUMsQ0FBQTtvQkF5Qk0sYUFBUSxHQUFHLFVBQVMsQ0FBTTt3QkFDN0IsTUFBTSxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLENBQUMsQ0FBQztvQkFFTSwyQkFBc0IsR0FBRyxDQUFDLEtBQVU7d0JBQzFDLElBQUksV0FBVyxDQUFDO3dCQUNoQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO3dCQUNyQyxJQUFJLFlBQVksR0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFjOzRCQUM1RCxNQUFNLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdkUsQ0FBQyxDQUFDLENBQUM7d0JBRUgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUM3QixZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDdEMsQ0FBQzt3QkFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQzt3QkFFMUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ3hDLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzdGLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ04sV0FBVyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQ2xELFdBQVcsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQzt3QkFDM0UsQ0FBQzt3QkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDM0MsQ0FBQyxDQUFBO29CQTVMQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztvQkFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7b0JBRTdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUN0QixDQUFDO29CQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUN0QixDQUFDO29CQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3ZGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3ZGLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzdGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRXhGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRWxELElBQUksQ0FBQyxlQUFlLEdBQUc7d0JBQ3JCLGVBQWUsRUFBRSxzQkFBc0I7d0JBQ3ZDLEtBQUssRUFBRSxNQUFNO3dCQUNiLGVBQWUsRUFBRSxLQUFLO3dCQUN0Qix3QkFBd0IsRUFBRSxFQUFFO3dCQUM1QixxQkFBcUIsRUFBRSxJQUFJLENBQUMsTUFBTTt3QkFDbEMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFdBQVc7d0JBQ3pDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxXQUFXO3FCQUM1QyxDQUFDO29CQUVGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFFTSxJQUFJO29CQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoQyxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDbEUsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDaEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUMvQyxDQUFDO2dCQUNILENBQUM7Z0JBRU0sUUFBUTtvQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUM3QixZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ25ELENBQUM7b0JBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUMzQixZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDNUMsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzNCLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUM1QyxDQUFDO29CQUVELFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUcsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUU5RCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUV2RixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUs7d0JBQzlCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUUvQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDMUksQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFFTixJQUFJLFdBQVcsR0FBRywrQkFBK0IsQ0FBQzt3QkFFbEQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBRXhFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQy9DLENBQUM7Z0JBQ0gsQ0FBQztnQkFFTSxZQUFZLENBQUMsUUFBYztvQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUN2RCxVQUFVLENBQUM7NEJBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQUEsQ0FBQzs0QkFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0MsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNWLENBQUM7Z0JBQ0gsQ0FBQztnQkFFTSxjQUFjO29CQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUVwQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFFeEksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUVyQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM1QyxDQUFDO3dCQUVELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQzt3QkFFdkYsSUFBSSxDQUFDLDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3dCQUUvSSxVQUFVLENBQUM7NEJBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQUEsQ0FBQzs0QkFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0MsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNWLENBQUM7Z0JBQ0gsQ0FBQztnQkErQk0sUUFBUTtvQkFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7Z0JBRU8sa0JBQWtCLENBQUMsT0FBeUI7b0JBQ2xELElBQUksYUFBYSxHQUFtQixFQUFFLENBQUM7b0JBQ3JDLElBQUksVUFBbUIsQ0FBQztvQkFDeEIsRUFBRSxDQUFDLENBQUMsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDaEMsSUFBSSxDQUFDOzRCQUNILFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNuQyxDQUFFO3dCQUFBLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ25CLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUNBQWlDLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQzdFLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUM7d0JBQ2pELENBQUM7b0JBQ0gsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixVQUFVLEdBQUcsT0FBTyxDQUFDO29CQUN2QixDQUFDO29CQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsYUFBYSxDQUFDO2dCQUN6QixDQUFDO1lBNEJILENBQUM7WUF4T0M7Z0JBQUMsNkJBQVE7O29EQUFBO1lBQ1Q7Z0JBQUMsNkJBQVE7O3NEQUFBO1lBQ1Q7Z0JBQUMsNkJBQVE7O3VEQUFBO1lBR1Q7Z0JBQUMsNkJBQVE7O3lEQUFBO1lBRVQ7Z0JBQUMsNkJBQVEsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLDZCQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7O3VEQUFBO1lBSXJEO2dCQUFDLDZCQUFROzs2REFBQTtZQUVUO2dCQUFDLDZCQUFROzswREFBQTtZQUVUO2dCQUFDLDZCQUFROzs0REFBQTtZQUNUO2dCQUFDLDZCQUFROzswREFBQTtZQUVUO2dCQUFDLDZCQUFROzswREFBQTtZQUNUO2dCQUFDLDZCQUFROzt5REFBQTtZQUNUO2dCQUFDLDZCQUFROzsrREFBQTtZQUNUO2dCQUFDLDZCQUFROztpRUFBQTtZQUNUO2dCQUFDLDZCQUFROztrRUFBQTtZQUNUO2dCQUFDLDZCQUFROzswREFBQTtZQUNUO2dCQUFDLDZCQUFROzsrREFBQTtZQTNCWDtnQkFBQyxrQ0FBYSxDQUFDLFFBQVEsQ0FBQztnQkFDdkIscUNBQU0sQ0FBQyxpQkFBRyxDQUFDLE9BQU8sRUFBRSwrQkFBYSxDQUFDOzs0QkFBQTtZQUNuQyxrQ0F5T0MsQ0FBQSJ9
