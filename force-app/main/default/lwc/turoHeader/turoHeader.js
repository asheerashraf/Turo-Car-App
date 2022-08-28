import { LightningElement, wire } from 'lwc';
import LOGO from '@salesforce/resourceUrl/logoTuro';
import { CurrentPageReference } from 'lightning/navigation';

export default class TuroHeader extends LightningElement {
    logo = LOGO
    styled = false

    //Getting current page reference
    @wire(CurrentPageReference)
    currentPageReference;


    renderedCallback() { 
        if(!this.styled){
            this.searchHeader();  
            this.styled = true; 
        }
    }

    //Applying styling class dynamically
    searchHeader(){
        if(this.currentPageReference.attributes.name === 'searchResults__c'){
            let hed = this.template.querySelector('.header');
            hed.classList.add('searchHeader');
        }
    } 
}