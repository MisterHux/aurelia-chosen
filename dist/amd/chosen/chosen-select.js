var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", 'aurelia-templating', 'aurelia-binding', 'aurelia-logging', 'aurelia-dependency-injection', 'aurelia-pal', 'jquery', 'lodash', 'harvesthq/chosen', 'harvesthq/chosen/chosen.min.css!text'], function (require, exports, aurelia_templating_1, aurelia_binding_1, LogManager, aurelia_dependency_injection_1, aurelia_pal_1, $, _) {
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
});
//# sourceMappingURL=chosen-select.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hvc2VuL2Nob3Nlbi1zZWxlY3QuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiY2hvc2VuL2Nob3Nlbi1zZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFhQTtRQTBDRSxzQkFBWSxPQUFvQixFQUFFLE1BQXNCO1lBMUMxRCxpQkF5T0M7WUF4T2tCLE9BQUUsR0FBWSxFQUFFLENBQUM7WUFDakIsU0FBSSxHQUFZLEVBQUUsQ0FBQztZQUNuQixVQUFLLEdBQVksRUFBRSxDQUFDO1lBR3BCLFlBQU8sR0FBbUIsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQUd4RCxVQUFLLEdBQTRCLElBQUksQ0FBQztZQUc1QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUV6QixhQUFRLEdBQWEsS0FBSyxDQUFDO1lBRTNCLGVBQVUsR0FBYSxLQUFLLENBQUM7WUFDN0IsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUUxQixhQUFRLEdBQWEsS0FBSyxDQUFDO1lBQzNCLFlBQU8sR0FBYSxLQUFLLENBQUM7WUFDMUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7WUFDOUIsb0JBQWUsR0FBWSxNQUFNLENBQUM7WUFDbEMscUJBQWdCLEdBQVksWUFBWSxDQUFDO1lBQ3pDLGFBQVEsR0FBWSxFQUFFLENBQUM7WUFHaEMsV0FBTSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUU7WUFTekMsV0FBTSxHQUFhLEtBQUssQ0FBQztZQUN6QixjQUFTLEdBQWEsS0FBSyxDQUFDO1lBQzVCLG1CQUFjLEdBQW1CLFNBQVMsQ0FBQztZQUUzQyxvQkFBZSxHQUFtQixTQUFTLENBQUM7WUFtSDVDLGdDQUEyQixHQUFHLFVBQUMsV0FBbUIsRUFBRSxrQkFBMEIsRUFBRSxvQkFBNEI7Z0JBQ2xILEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLEtBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztv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
