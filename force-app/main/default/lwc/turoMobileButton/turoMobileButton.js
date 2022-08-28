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

    //registers when user clicks filter button
    filterClicked(){
        this.isClicked = true;
        this.publishMobileFilter();
    }

    //sends data to turo2Filter component
    publishMobileFilter(){
        publish(this.context, mobilefilterMC, {isClicked:this.isClicked})
    }

    mapButton(event){
        //hides map button after user clicks map
        let map = event.target.classList
        map.add('slds-hide')
        //shows map button after user clicks map
        let list = this.template.querySelector('.listButton')
        list.classList.remove('slds-hide')

        //hides car list and shows map component
        document.documentElement.style.setProperty('--displayCars', 'none');
        document.documentElement.style.setProperty('--displayMap', 'flex');
    }

    listButton(event){
        //hides list button after user clicks list
        let list = event.target.classList
        list.add('slds-hide')
        //shows map button after user clicks list
        let map = this.template.querySelector('.mapButton')
        map.classList.remove('slds-hide')
        //hides map component and shows car list
        document.documentElement.style.setProperty('--displayCars', 'flex');
        document.documentElement.style.setProperty('--displayMap', 'none');
    }

}