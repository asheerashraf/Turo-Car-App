import { LightningElement, wire } from 'lwc';
import {getObjectInfo, getPicklistValuesByRecordType} from 'lightning/uiObjectInfoApi';
import CAR_OBJECT from '@salesforce/schema/Car__c';
import filterMC from '@salesforce/messageChannel/carFilter__c';
import {publish, MessageContext} from 'lightning/messageService';

export default class CarFilter extends LightningElement {

    filters = {
        searchKey: '',
        maxRate: 200, //this value sets initial slider position on filter after component render. 
        make: [],
        type: [],
    }

    carObject; //stores Car__c object metadata
    make = []; //stores Vehicle Make queried via wire service
    filteredMake = [] //stores filtered Vehicle Make
    type = []; //stores Vehicle Type queried via wire service
    filteredType = [] //stores filtered Vehicle Type
    error = 'Could not fetch data from wire service' //error message if wire service fails



    //search text handles car name. Pass on as paramater in. in apex variable = % 'var' % 
    //slider pass on max rate and apex controller sends price less than max rate 

    //checkbox?

    connectedCallback(){
        this.publishFilterinfo();
    }

    @wire(MessageContext)
    context;

    // Fetching Car__c object metadata to get recordTypeId
    @wire(getObjectInfo, {objectApiName : CAR_OBJECT})
    carObjectHandler({data,error}){
        if(data){
            this.carObject = data;
        }
        if(error){
            console.error(error);
        }
    }

    // Fetching picklist values
    @wire(getPicklistValuesByRecordType, { recordTypeId: '$carObject.defaultRecordTypeId', objectApiName : CAR_OBJECT,})
    picklistHandler({data,error}){
        if(data){
            this.make = data.picklistFieldValues.Vehicle_Make__c.values
            this.make = this.convertToStringArray(this.make)
        
            this.type =  data.picklistFieldValues.Vehicle_Type__c.values
            this.type = this.convertToStringArray(this.type)

        }
        if(error){
            console.error(error);
        }
    }

    // Handles text search
    searchKeyHandler(event){
        this.filters = {...this.filters, 'searchKey':(event.target.value).trim()}
        this.publishFilterinfo();
    }

    // Handles slider for vehicle day rate
    sliderHandler(event){
        this.filters = {...this.filters, 'maxRate':event.target.value}
        this.publishFilterinfo();
    }

    // Handles checkbox for vehice type and make
    checkboxHandler(event){
        const {name, value} = event.target.dataset

        if(name==='Vehicle_Type__c'){
            this.filters.type.indexOf(value) === -1 ? 
            this.filters.type.push(value) : 
            this.filters.type.splice(this.filters.type.indexOf(value),1)
                console.log('filter type',this.filters.type)    
        }

        if(name==='Vehicle_Make__c'){
            this.filters.make.indexOf(value) === -1 ? 
            this.filters.make.push(value) : 
            this.filters.make.splice(this.filters.make.indexOf(value),1)
                console.log('filter type',this.filters.make)    
        }

        this.publishFilterinfo();
    }

    //used to send filter object to other components.
    publishFilterinfo(){
        publish(this.context, filterMC, {filters:this.filters})
    }

    convertToStringArray(data){
        return data.map(item=>{
            return item.value
        })
    }
    
}