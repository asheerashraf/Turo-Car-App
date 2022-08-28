import { LightningElement, wire, } from 'lwc';
import filterMC from '@salesforce/messageChannel/carFilter__c';
import {publish, MessageContext} from 'lightning/messageService';
import {getObjectInfo, getPicklistValuesByRecordType} from 'lightning/uiObjectInfoApi';
import CAR_OBJECT from '@salesforce/schema/Car__c';


export default class CarFilterDropdown extends LightningElement {
    isOpen = false;
    isPrice= false;
    isMake= false;
    isType= false;

    filters = {
        searchKey: '',
        maxRate: 200, //this value sets initial slider position on filter after component render. 
        make: [],
        type: [],
    }

    carRecordTypeId;
    makePicklist;
    selectedMake;
    typePicklist;

    connectedCallback(){
        this.publishFilterinfo();
    }


    @wire(MessageContext)
    context;

    @wire(getPicklistValuesByRecordType, {objectApiName : CAR_OBJECT, recordTypeId: '$carRecordTypeId'})
    carPicklistsHandler({data, error}){
        if(data){
            this.makePicklist = data.picklistFieldValues.Vehicle_Make__c.values
            this.typePicklist = data.picklistFieldValues.Vehicle_Type__c.values.map(item=>{
                return {...item, checked: false}
            })
        }
        if(error){
            console.error(error);
        }
    };

    @wire(getObjectInfo, {objectApiName : CAR_OBJECT})
    carObjectHandler({data, error}){
        if(data){
            this.carRecordTypeId = data.defaultRecordTypeId
        }
        if(error){
            console.error(error);
        }
    };

    // Handles user input on vehicle day rate (price) slider 
    priceHandler(event){
        this.filters = {...this.filters, 'maxRate':event.target.value}
        this.publishFilterinfo();
    }

        // Handles user input on vehice type checkbox
        typeHandler(event){
            const {name, value} = event.target.dataset
    
            if(name==='Vehicle_Type__c'){
                this.filters.type.indexOf(value) === -1 ? 
                (this.filters.type.push(value) , this.typePicklist.forEach(item =>{
                    if(item.value === value){item.checked = true;}})
                ) : 
                (this.filters.type.splice(this.filters.type.indexOf(value),1) , this.typePicklist.forEach(item =>{
                    if(item.value === value){item.checked = false;}})   
                )
            }       
            this.publishFilterinfo();
        }

        // Handles user input on vehice make dropdown list
        makeHandler(event){
            this.selectedMake = event.currentTarget.value;
            this.filters = {...this.filters, 'make':this.selectedMake}
            console.log('filters',this.filters) 
            this.publishFilterinfo();
        }

    filterClick(event){
        if(event.target.label === 'Price'){
            this.isPrice = true;
        } 
        else if(event.target.label === 'Make'){
            this.isMake = true;
        } 
        else if(event.target.label === 'Vehicle Type'){
            this.isType = true;
        } 
    }

    closeHandler(){
        this.isType = false;
        this.isMake = false;
        this.isPrice = false;
    }

//used to send filter object to other components.
publishFilterinfo(){
    publish(this.context, filterMC, {filters:this.filters})
}


// get options() {
//     return this.makePicklist.map(item=>{
//         return {label: item.label, value: item.value}
//     })
// }

get make(){
    return this.filters.make
}

get filterButton(){
    return 'View Results'
}


}