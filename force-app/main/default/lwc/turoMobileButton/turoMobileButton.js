import { LightningElement, wire } from 'lwc';
import filter_White2 from '@salesforce/resourceUrl/filterWhite2'
import map_White from '@salesforce/resourceUrl/mapWhite';
import {publish, MessageContext} from 'lightning/messageService';
import mobilefilterMC from '@salesforce/messageChannel/mobileFilter__c';
import list_White from '@salesforce/resourceUrl/listWhite';

export default class TuroMobileButton extends LightningElement {
    list = list_White
    map = map_White
    filter = filter_White2
    isClicked = false;

    connectedCallback(){
        this.publishMobileFilter();
    }

    @wire(MessageContext)
    context;

    filterClicked(){
        this.isClicked = true;
        this.publishMobileFilter();
    }

    publishMobileFilter(){
        publish(this.context, mobilefilterMC, {isClicked:this.isClicked})
        // this.isClicked=false;
    }

    mapButton(event){
        let map = event.target.classList
        map.add('slds-hide')

        let list = this.template.querySelector('.listButton')
        list.classList.remove('slds-hide')

console.log('doc', document.documentElement.style)
        document.documentElement.style.setProperty('--displayCars', 'none');
        document.documentElement.style.setProperty('--displayMap', 'flex');
    }

    listButton(event){
        let list = event.target.classList
        list.add('slds-hide')

        let map = this.template.querySelector('.mapButton')
        map.classList.remove('slds-hide')

        document.documentElement.style.setProperty('--displayCars', 'flex');
        document.documentElement.style.setProperty('--displayMap', 'none');
    }

}