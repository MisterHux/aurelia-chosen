//import {computedFrom} from 'aurelia-framework';
import {computedFrom, LogManager, inject, bindable, bindingMode} from 'aurelia-framework';
import DataItem from 'models/DataItem';

export class Welcome {
  heading = 'Welcome to the Aurelia Navigation App!';
  firstName = 'John';
  lastName = 'Doe';
  previousValue = this.fullName;
  private logger = LogManager.getLogger("Welcome");
  public items: Array<DataItem>;
  public item: DataItem | Array<DataItem>;
  

  //Getters can't be directly observed, so they must be dirty checked.
  //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  //To optimize by declaring the properties that this getter is computed from, uncomment the line below
  //as well as the corresponding import above.
  @computedFrom('firstName', 'lastName')
  get fullName() {
    let fullName: string = `${this.firstName} ${this.lastName}`
      return fullName;
  }

    public activate(): void {

        setTimeout(()  => {
            var tempItems = JSON.parse('[ \
          { "uniqueName": "One", "description": "This is the first value", "hasStatus": false, "id": "aza" }, \
          { "uniqueName": "Second", "description": "A second value", "hasStatus": true, "id": "4PE" }, \
          { "uniqueName": "Third Choice", "description": "My third choice", "hasStatus": false, "id": "oyV" }, \
          { "uniqueName": "D", "description": "option four", "hasStatus": true, "id": "Xvy" }, \
          { "uniqueName": "Number Five", "description": "Johnny Five is this chocie.",  "hasStatus": false, "id": "meW" } ]');
         this.items = tempItems.map((claim: Object) => {return new DataItem(claim);})     
        }, 200);
              
              
    }

    submit() {
      this.previousValue = this.fullName;
      //alert(`Welcome, ${this.fullName}!`);
      var newName = `New Item - ${this.fullName}`;
      var test = this.items;
      
      test.push(new DataItem(JSON.parse('{ "uniqueName": "'+newName+'", "description": "Adding new item with first name: '+this.firstName+'", "id": "Gjp" }')))
      this.items = test;
      this.logger.debug(this.items);    
    }

    public itemChanged(newItem) {
        this.logger.debug('itemChanged', newItem);
    }

    public myEventCallback(evt) {
        this.logger.debug('myEventCallback', evt);
        // The selected value will be printed out to the browser console
    }

    canDeactivate() {
        if (this.fullName !== this.previousValue) {
        return confirm('Are you sure you want to leave?');
        }
  }
}

export class UpperValueConverter {
  toView(value) {
    return value && value.toUpperCase();
  }
}
