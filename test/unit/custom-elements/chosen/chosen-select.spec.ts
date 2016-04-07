import ChosenSelect from 'src/components/custom-elements/chosen/chosen-select';
import {Container} from 'aurelia-dependency-injection';
import {Controller, BehaviorInstruction, TemplatingEngine} from 'aurelia-templating';
import {DOM} from 'aurelia-pal';

let element = document.createElement('div');

describe('the chosen-select custom element', () => {
  let container;
  let templatingEngine;

  // Before each test, we set some things up
  beforeEach(() => {
    // Create a global container from the dependency-injection module
    container = new Container().makeGlobal();
    // Register an instance of Element and set it to be a DIV.
    container.registerInstance(DOM.Element, element);
        
    templatingEngine = container.get(TemplatingEngine);

  });  
  

  it('constructs with a default values', () => {
    let cs : ChosenSelect = templatingEngine.createViewModelForUnitTest(ChosenSelect);
    expect(cs.disabledProperty).toEqual('isDisabled');
    expect(cs.valueProperty).toEqual('id');
    expect(cs.displayProperty).toEqual('name');
    expect(cs.disabled).toEqual(false);
    expect(cs.noLabel).toEqual(false);
    expect(cs.multiple).toEqual(false);
    expect(cs.readonly).toEqual(false);
    expect(cs.placeholder).toEqual('');
    expect(cs.helpText).toEqual('');
    expect(cs.value).toEqual(null);
    expect(cs.options).toEqual([]);
    expect(cs.bind).toBeDefined();
    expect(cs.attached).toBeDefined();
    expect(cs.valueChanged).toBeDefined();
    expect(cs.optionsChanged).toBeDefined();
    expect(cs.detached).toBeDefined();
  });
  
});

