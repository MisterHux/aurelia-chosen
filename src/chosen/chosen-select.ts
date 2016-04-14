import { bindable, customElement } from 'aurelia-templating';
import { bindingMode, BindingEngine } from 'aurelia-binding';
import * as LogManager from 'aurelia-logging';
import { inject } from 'aurelia-dependency-injection';
import {DOM} from 'aurelia-pal';

import 'harvesthq/chosen';
import 'harvesthq/chosen/chosen.min.css!';

import * as $ from 'jquery'; 
import * as _ from 'lodash';

@customElement('chosen')
@inject(DOM.Element, BindingEngine)
export default class ChosenSelect {
  @bindable public id : string = '';
  @bindable public name : string = '';

  @bindable public label: string = '';
  
  //@bindable({ defaultBindingMode: bindingMode.twoWay })
  @bindable public options : Array<Object> = new Array<Object>();
  
  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public value : Object | Array<Object> = null;

  // placeholder text.  can actually be overriden if chosenOptions values are set.
  @bindable public placeholder: string = "";
  // set the drop down to be read-only
  @bindable public readonly : boolean = false;
  // set the control to be inline (label and drop down on one line)
  @bindable public inlineForm : boolean = false;
  @bindable public disabled: boolean = false;
  // allow the dropdown to be a multi select
  @bindable public multiple : boolean = false;
  @bindable public valueProperty : string = "id";
  @bindable public displayProperty : string = "name";
  @bindable public disabledProperty : string = "isDisabled";
  @bindable public groupProperty : string = "optGroup";
  @bindable public optgroup : boolean = false;
  @bindable public helpText : string = "";
  @bindable public chosenOptions : string;
      
  private logger = LogManager.getLogger("chosen") ;

  private _element: HTMLElement;
  private _bindingContext: Object;
  private _overrideContext: Object;
  private _bindingEngine: BindingEngine;
  private _select: HTMLSelectElement;
  private _label: HTMLLabelElement;
  private _helpTextLabel: HTMLElement;
  private _chosenObject: any;
  private _optionsSubscription: any;
  private _clear: boolean = false;
  public _noLabel : boolean = false;
  public _noHelpText : boolean = false;
  private _multiple : boolean = false;
  private _optGroup : boolean = false;
  private _chosenOptions : ChosenOptions = undefined;
  
  private _chosenDefaults : ChosenOptions = undefined;

  @bindable public optionGroups: Array<Object> = new Array<Object>();
  
  constructor(element: HTMLElement, engine : BindingEngine) {
    this._element = element;
    this._bindingEngine = engine;

    if (!this.id && this.name) {
      this.id = this.name;
    }

    if (!this.name && this.id) {
      this.name = this.id;
    }
  }

  public bind(bindingContext: any, overrideContext: any) {
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
      // if the noLabel option is set, but the label field has a value, then default to showing the label.
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
    } else {
      this.optionGroups = this.options;
    }
    
  }

  public attached() {
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
      // when this was in the constructor it wasn't correctly setting the observer, throws an error if this.options doesn't have any values
      this._optionsSubscription = this._bindingEngine.collectionObserver(this.options).subscribe(splices => this.someOptionsChanged(splices));
    } else {
      // still want to set chosen but set it to disabled untill there are objects to choose from
      var waitingText = 'Please wait, gathering values';

      this.changeChosenPlaceholderText(waitingText, waitingText, waitingText);
      
      this._chosenObject.attr("disabled", "disabled");
      this.triggerChosenReDraw(10);
    }
  }

  public detached() {
    this.logger.debug('detached');
    this._optionsSubscription.dispose();
    this._chosenObject.chosen('destroy').off('change');
  }

  private valueChanged(newValue : any, oldValue?: any) : void {
    this.logger.debug('valueChanged');
    if (this._chosenObject !== undefined && this._multiple) {
      this.triggerChosenReDraw();
    }
  }

  private readonlyChanged(newValue: boolean, oldValue: boolean) : void {
    if (newValue !== oldValue) {
      this.logger.debug('readonlyChanged');
      if (newValue === true) {
        this._chosenObject.attr("readonly", true);
      } else {
        this._chosenObject.removeAttr("readonly")
      }

      this.triggerChosenReDraw();
    }
  }

  private disabledChanged(newValue: boolean, oldValue: boolean) : void {
    if (newValue !== oldValue) {
      this.logger.debug('disabledChanged');
      if (newValue === true) {
        this._chosenObject.attr("disabled", true);
      } else {
        this._chosenObject.removeAttr("disabled")
      }

      this.triggerChosenReDraw();
    }
  }

  private displayPropertyChanged(newValue: string, oldValue: string) : void {
    if (newValue !== oldValue) {
      this.triggerChosenReDraw();
    }
  }  

  private valuePropertyChanged(newValue: string, oldValue: string) : void {
    if (newValue !== oldValue) {
      this.triggerChosenReDraw();
    }
  }  

  private disabledPropertyChanged(newValue: string, oldValue: string) : void {
    if (newValue !== oldValue) {
      this.triggerChosenReDraw();
    }
  }  

  private groupPropertyChanged(newValue: string, oldValue: string) : void {
    if (newValue !== oldValue) {
      if (this._optGroup) {
        this.optionGroups = _.uniq(_.map(this.options, this.groupProperty));
      } else {
        this.optionGroups = this.options;
      }
      this.triggerChosenReDraw();
    }
  }  

  private optgroupChanged(newValue: boolean, oldValue: boolean) : void {
    if (newValue !== oldValue) {
      this._optGroup = newValue;
      if ((this._optGroup) && (this.isNullOrEmpty(this.groupProperty) === false)) {
        this.optionGroups = _.uniq(_.map(this.options, this.groupProperty));
      } else {
        this.optionGroups = this.options;
      }
      this.triggerChosenReDraw();
    }
  }

  private omultipleChanged(newValue: boolean, oldValue: boolean) : void {
    if (newValue !== oldValue) {
      this._multiple = newValue;
      
      this.triggerChosenReDraw();
    }
  }  

  private placeholderChanged(newValue: string, oldValue: string) : void {
    if (newValue !== oldValue) {
      this.changeChosenPlaceholderText(newValue, newValue, newValue);
      this.triggerChosenReDraw();
    }
  }  

  private optionsChanged() {
    this.logger.debug('optionsChanged');
    // when this was in the constructor it wasn't correctly setting the observer, make sure that a subscription is set
    this._optionsSubscription = this._bindingEngine.collectionObserver(this.options).subscribe(splices => this.someOptionsChanged(splices));
        
    if (this._chosenObject !== undefined) {
      // reset the place holder text and remove the disabled options
      if (this.disabled === false) {
        this._chosenObject.removeAttr("disabled");
      }

      var selectedItemText = this.placeholder !== "" ? this.placeholder : "Select an Option";

      this.changeChosenPlaceholderText(selectedItemText, this._chosenOptions.placeholder_text_single, this._chosenOptions.placeholder_text_multiple);
    
      this.triggerChosenReDraw();
    } 
  }

  private changeChosenPlaceholderText = (placeholder: string, placeholder_single: string, placeholder_multiple: string): void => {
    if (this._chosenObject !== undefined || this._chosenObject !== null) {
      var chosenData = this._chosenObject.data("chosen");
      chosenData.default_text = placeholder;
      chosenData.options.placeholder_text_multiple = placeholder_single;
      chosenData.options.placeholder_text_single = placeholder_multiple;
      if (this._multiple === false) {
        $("span", _.head(chosenData.selected_item)).text(placeholder);
      } else {
        var input: any = _.head(chosenData.search_field);
        input.value = placeholder;
        input.defaultValue = placeholder;
      }
    }
  }

  private triggerChosenReDraw = (delay: number = 100): void => {
    setTimeout(() => {
      this._chosenObject.trigger("liszt:updated");
      this._chosenObject.trigger("chosen:updated");
    }, delay);
  }
  
  private someOptionsChanged = (splices: any): void  => {
    // make sure that the chosen list is updated when the underlying data is changed.
    // don't actually care about splices.
    this.logger.debug('someOptionsChanged');
    
    if (this._chosenObject !== undefined) {
      this.triggerChosenReDraw();
    }
  }
  

  private parseChosenOptions = (options : string | Object) : ChosenOptions => {
    let chosenOptions : ChosenOptions = {};
    let parsedData : Object;
    if (typeof options === "string") {
      try {
        parsedData = JSON.parse(options);
      } catch (exception) {
        var fixedJson = options.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');  
        parsedData = JSON.parse("{" + fixedJson + "}");
      }
    } else {
      parsedData = options;
    }
    Object.assign(chosenOptions, parsedData);
    return chosenOptions;
  }

  private isTruthy = (toTest: any): boolean => {
      return (/^(true|yes|1|y|on)$/i).test(toTest);
  };

  private isNullOrEmpty = (toTest: string): boolean => {
    return ((toTest === undefined) || (toTest === null) || (toTest === ''));
  }

  private onSelectionChangeEvent = (event: any) : void => {
    let changeEvent;
    let newValue = $(this._select).val();
    let valueObjects: any = _.filter(this.options, (option: Object): any => {
      return newValue && newValue.indexOf(option[this.valueProperty]) >= 0;
    });

    if (this._multiple === false) {
      valueObjects = _.head(valueObjects);
    }
    
    this.value = valueObjects;

    if (window["CustomEvent"] !== undefined) {
      changeEvent = new CustomEvent('change', { detail: {value: valueObjects }, bubbles: true });
    } else {
      changeEvent = document.createEvent('CustomEvent');
      changeEvent.initCustomEvent('change', true, true, {value: valueObjects});
    }
    this._element.dispatchEvent(changeEvent);
  }

}

export class FilterOnPropertyValueConverter {
  toView(array: {}[], property: string, exp: string) {
    if (array === undefined || array === null || property === undefined || exp === undefined) {
      return array;
    }
    if (exp.startsWith("!")) {
      // filtering here on the off chance that an item was added without the group property, still want it added to then end of list.
      // not the most efficent.
      return array.filter((item) => {
        // if not the !property, then return true only if the item doesn't have the group value.
        let itemProp = item[property];
        let returnValue = (itemProp !== undefined && itemProp !== null) === false;
        return returnValue;
      });
    } else {
      return array.filter((item) => {
        // if the item doesn't have the property return false.
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