import {bindable, inject, customElement, computedFrom, bindingMode, LogManager, BindingEngine} from 'aurelia-framework';
import {DOM} from 'aurelia-pal';

import 'harvesthq/chosen';
import 'harvesthq/chosen/chosen.min.css!text';
import * as $ from 'jquery'; 
import * as _ from 'lodash';

@customElement('chosen')
@inject(DOM.Element, BindingEngine)
export default class ChosenSelect {
  @bindable public id : string = '';
  @bindable public name : string = '';
  @bindable public label : string = '';
  
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
  @bindable public noLabel : boolean = false;
  @bindable public valueProperty : string = "id";
  @bindable public displayProperty : string = "name";
  @bindable public disabledProperty : string = "isDisabled";
  @bindable public helpText : string = "";
  @bindable public chosenOptions : string;
      
  private logger = LogManager.getLogger("chosen") ;

  private _element: HTMLElement;
  private _bindingEngine: BindingEngine;
  private _select: HTMLSelectElement;
  private _label: HTMLLabelElement;
  private _helpTextLabel: HTMLElement;
  private _chosenObject: any;
  private _optionsSubscription: any;
  private _clear : boolean = false;
  private _multiple : boolean = false;
  private _chosenOptions : ChosenOptions = undefined;
  
  private _chosenDefaults : ChosenOptions = undefined;
  
  constructor(element: HTMLElement, engine : BindingEngine) {
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

  public bind() {
    this.logger.debug('bind');
    if (this.value !== null && this.value !== undefined) {
      this.valueChanged(this.value);
    }
    if (this.chosenOptions !== undefined && this.chosenOptions !== '') {
      var passedOptions = this.parseChosenOptions(this.chosenOptions);
      _.extend(this._chosenOptions, passedOptions);
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
      this._chosenObject.trigger("liszt:updated");
      this._chosenObject.trigger("chosen:updated");
    }
  }

  public valueChanged(newValue : any) {
    this.logger.debug('valueChanged');
    if (this._chosenObject !== undefined && this._multiple) {
      setTimeout(() => {
        this._chosenObject.trigger("liszt:updated");;
        this._chosenObject.trigger("chosen:updated");
      }, 100);
    }
  }

  public optionsChanged() {
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
    
      setTimeout(() => {
        this._chosenObject.trigger("liszt:updated");;
        this._chosenObject.trigger("chosen:updated");
      }, 100);
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
  
  private someOptionsChanged = (splices: any): void  => {
    // make sure that the chosen list is updated when the underlying data is changed.
    // don't actually care about splices.
    this.logger.debug('someOptionsChanged');
    
    if (this._chosenObject !== undefined) {
      setTimeout(() => {
        this._chosenObject.trigger("liszt:updated");;
        this._chosenObject.trigger("chosen:updated");
      }, 100);
    }
  }
  
  public detached() {
      this.logger.debug('detached');
      this._optionsSubscription.dispose();
      this._chosenObject.chosen('destroy').off('change');
  }

  private parseChosenOptions(options : string | Object) : ChosenOptions {
    var chosenOptions : ChosenOptions = {};
      var parsedData : Object;
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

  public isTruthy = function(b: any): boolean {
      return (/^(true|yes|1|y|on)$/i).test(b);
  };

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