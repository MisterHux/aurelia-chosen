declare module 'MisterHux/aurelia-chosen' {
  import { BindingEngine } from 'aurelia-binding';
  import {DOM} from 'aurelia-pal';
  import 'harvesthq/chosen';
  import 'harvesthq/chosen/chosen.min.css!';

  export class ChosenSelect {
    id: string;
    name: string;
    label: string;
    options: Array<Object>;
    value: Object | Array<Object>;
    optionGroups: Array<Object>;

    readonly: boolean;
    inlineForm: boolean;
    disabled: boolean;
    multiple: boolean;
    optgroup: boolean;
    
    valueProperty: string;
    displayProperty: string;
    disabledProperty: string;
    groupProperty: string;

    placeholder: string;
    helpText: string;
    chosenOptions: string;

    constructor(element: HTMLElement, engine: BindingEngine);

    bind(bindingContext: any, overrideContext: any): void;
    attached(): void;

    valueChanged(newValue: any): void;
    readonlyChanged(newValue: boolean, oldValue: boolean): void;
    disabledChanged(newValue: boolean, oldValue: boolean): void;
    displayPropertyChanged(newValue: string, oldValue: string): void;
    valuePropertyChanged(newValue: string, oldValue: string): void;
    disabledPropertyChanged(newValue: string, oldValue: string): void;
    groupPropertyChanged(newValue: string, oldValue: string): void;

    optionsChanged(): void;

    detached(): void;

  }
}