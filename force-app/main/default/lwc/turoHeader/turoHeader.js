import { LightningElement, wire } from 'lwc';
import LOGO from '@salesforce/resourceUrl/logoTuro';
import { CurrentPageReference } from 'lightning/navigation';

export default class TuroHeader extends LightningElement {
    logo = LOGO
    styled = false

    @wire(CurrentPageReference)
    currentPageReference;


    renderedCallback() { 
        console.log('rendered search')
        if(!this.styled){
            this.searchHeader();  
            this.styled = true; 
        }
    }

    searchHeader(){
        console.log(this.currentPageReference.attributes.name );
        if(this.currentPageReference.attributes.name === 'searchResults__c'){
            console.log('fire in hole')
            let hed = this.template.querySelector('.header');
            console.log('hed',hed)
            hed.classList.add('searchHeader');
        }
    } 
}