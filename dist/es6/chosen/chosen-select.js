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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ChosenSelect;
});
//# sourceMappingURL=chosen-select.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hvc2VuL2Nob3Nlbi1zZWxlY3QuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiY2hvc2VuL2Nob3Nlbi1zZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFhQTtRQTBDRSxZQUFZLE9BQW9CLEVBQUUsTUFBc0I7WUF6Q3ZDLE9BQUUsR0FBWSxFQUFFLENBQUM7WUFDakIsU0FBSSxHQUFZLEVBQUUsQ0FBQztZQUNuQixVQUFLLEdBQVksRUFBRSxDQUFDO1lBR3BCLFlBQU8sR0FBbUIsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQUd4RCxVQUFLLEdBQTRCLElBQUksQ0FBQztZQUc1QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUV6QixhQUFRLEdBQWEsS0FBSyxDQUFDO1lBRTNCLGVBQVUsR0FBYSxLQUFLLENBQUM7WUFDN0IsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUUxQixhQUFRLEdBQWEsS0FBSyxDQUFDO1lBQzNCLFlBQU8sR0FBYSxLQUFLLENBQUM7WUFDMUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7WUFDOUIsb0JBQWUsR0FBWSxNQUFNLENBQUM7WUFDbEMscUJBQWdCLEdBQVksWUFBWSxDQUFDO1lBQ3pDLGFBQVEsR0FBWSxFQUFFLENBQUM7WUFHaEMsV0FBTSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUU7WUFTekMsV0FBTSxHQUFhLEtBQUssQ0FBQztZQUN6QixjQUFTLEdBQWEsS0FBSyxDQUFDO1lBQzVCLG1CQUFjLEdBQW1CLFNBQVMsQ0FBQztZQUUzQyxvQkFBZSxHQUFtQixTQUFTLENBQUM7WUFtSDVDLGdDQUEyQixHQUFHLENBQUMsV0FBbUIsRUFBRSxrQkFBMEIsRUFBRSxvQkFBNEI7Z0JBQ2xILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDcEUsSUFBSSxVQUFV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
