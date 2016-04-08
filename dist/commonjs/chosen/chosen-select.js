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
const aurelia_templating_1 = require('aurelia-templating');
const aurelia_binding_1 = require('aurelia-binding');
const LogManager = require('aurelia-logging');
const aurelia_dependency_injection_1 = require('aurelia-dependency-injection');
const aurelia_pal_1 = require('aurelia-pal');
require('harvesthq/chosen');
require('harvesthq/chosen/chosen.min.css!text');
const $ = require('jquery');
const _ = require('lodash');
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
//# sourceMappingURL=chosen-select.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hvc2VuL2Nob3Nlbi1zZWxlY3QuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiY2hvc2VuL2Nob3Nlbi1zZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFDQUF3QyxvQkFBb0IsQ0FBQyxDQUFBO0FBQzdELGtDQUEyQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzdELE1BQVksVUFBVSxXQUFNLGlCQUFpQixDQUFDLENBQUE7QUFDOUMsK0NBQXVCLDhCQUE4QixDQUFDLENBQUE7QUFDdEQsOEJBQWtCLGFBQWEsQ0FBQyxDQUFBO0FBRWhDLFFBQU8sa0JBQWtCLENBQUMsQ0FBQTtBQUMxQixRQUFPLHNDQUFzQyxDQUFDLENBQUE7QUFDOUMsTUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDNUIsTUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFJNUI7SUEwQ0UsWUFBWSxPQUFvQixFQUFFLE1BQXNCO1FBekN2QyxPQUFFLEdBQVksRUFBRSxDQUFDO1FBQ2pCLFNBQUksR0FBWSxFQUFFLENBQUM7UUFDbkIsVUFBSyxHQUFZLEVBQUUsQ0FBQztRQUdwQixZQUFPLEdBQW1CLElBQUksS0FBSyxFQUFVLENBQUM7UUFHeEQsVUFBSyxHQUE0QixJQUFJLENBQUM7UUFHNUIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFFekIsYUFBUSxHQUFhLEtBQUssQ0FBQztRQUUzQixlQUFVLEdBQWEsS0FBSyxDQUFDO1FBQzdCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIsYUFBUSxHQUFhLEtBQUssQ0FBQztRQUMzQixZQUFPLEdBQWEsS0FBSyxDQUFDO1FBQzFCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBQzlCLG9CQUFlLEdBQVksTUFBTSxDQUFDO1FBQ2xDLHFCQUFnQixHQUFZLFlBQVksQ0FBQztRQUN6QyxhQUFRLEdBQVksRUFBRSxDQUFDO1FBR2hDLFdBQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFFB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
