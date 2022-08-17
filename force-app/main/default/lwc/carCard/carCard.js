import { LightningElement, wire } from 'lwc';
import {APPLICATION_SCOPE, subscribe, unsubscribe, MessageContext} from 'lightning/messageService';
import carMC from '@salesforce/messageChannel/selectedCar__c';

export default class CarCard extends LightningElement {

@wire(MessageContext)
context;
sub;

selectedCar = []

connectedCallback(){
    this.subscribeMessage();
    this.customSize();
}

disconnectedCallback(){
    unsubscribe(this.sub)
    this.sub = null
}

subscribeMessage(){
    this.sub = subscribe(this.context, carMC, (message)=>{this.handleMessage(message)}, {scope: APPLICATION_SCOPE});
}

handleMessage(data){
    this.selectedCar = data.car
    //carReceived = true;
    console.log('received', this.selectedCar)
}

get carReceived(){
    if(this.selectedCar.length > 0){
        return true;
    }
    return false;
}

get car(){
    return this.selectedCar[0]
}

customSize(){
    console.log(this.template.host.style)
}


}