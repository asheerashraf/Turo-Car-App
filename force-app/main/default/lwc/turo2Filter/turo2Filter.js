import { LightningElement, wire, } from 'lwc';
import filterMC from '@salesforce/messageChannel/carFilter__c';
import resultMC from '@salesforce/messageChannel/resultTotal__c';
import {publish, MessageContext, APPLICATION_SCOPE, subscribe, unsubscribe} from 'lightning/messageService';
import {getObjectInfo, getPicklistValuesByRecordType} from 'lightning/uiObjectInfoApi';
import CAR_OBJECT from '@salesforce/schema/Car__c';
import mobilefilterMC from '@salesforce/messageChannel/mobileFilter__c';
import cityMC from '@salesforce/messageChannel/citySearch__c';


export default class CarFilterDropdown extends LightningElement {
    
    //Determines what filter modal to display on HTML template
    isOpen = false;
    isPrice= false;
    isMake= false;
    isType= false;
    mobileFilter = false;

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
    selectedType
    sub;
    sub2
    subCity
    resultTotal;

    @wire(MessageContext)
    context;

    connectedCallback(){
        this.publishFilterinfo();
        this.subscribeMessage();
    }
    
    subscribeMessage(){
        this.sub = subscribe(this.context, mobilefilterMC, (message)=>{this.handleMessage(message)}, {scope: APPLICATION_SCOPE});
        this.sub2 = subscribe(this.context, resultMC, (item)=>{this.handleResult(item)}, {scope: APPLICATION_SCOPE}); 
    }

    //Receives onclick event from turoMobileButton component
    handleMessage(data){
        this.mobileFilter = data.isClicked;
    }

    //how many vehicles found from search result (size of car array from turoCarTile component)
    handleResult(data){
        this.resultTotal = data.results
    }

    disconnectedCallback(){
        unsubscribe(this.sub)
        unsubscribe(this.sub2)
        unsubscribe(this.subCity)
        this.sub = null
        this.sub2 = null
        this.subCity = null
    }

    @wire(getPicklistValuesByRecordType, {objectApiName : CAR_OBJECT, recordTypeId: '$carRecordTypeId'})
    carPicklistsHandler({data, error}){
        if(data){
            this.makePicklist = data.picklistFieldValues.Vehicle_Make__c.values.map(item=>{
                return item.value;
            })
            console.log('make picklist', this.makePicklist)
            this.makePicklist.push('All')
            this.makePicklist.sort((a, b) => a.localeCompare(b))
        

            this.typePicklist = data.picklistFieldValues.Vehicle_Type__c.values.map(item=>{
                return {...item, checked: false}
            })      
        }
        if(error){
            console.error(error);
        }
    }

    @wire(getObjectInfo, {objectApiName : CAR_OBJECT})
    carObjectHandler({data, error}){
        if(data){
            this.carRecordTypeId = data.defaultRecordTypeId
        }
        if(error){
            console.error(error);
        }
    }

    // Handles user input on vehicle day rate (price) slider 
    priceHandler(event){
        this.filters = {...this.filters, 'maxRate':event.target.value}
        //sending update filter data to turoCarTile Component
        this.publishFilterinfo();
    }

    // Handles user input on vehice type checkbox
    typeHandler(event){
        const {name, value} = event.target.dataset

        if(name==='Vehicle_Type__c'){
            //checks if type already exists in filter array
            this.filters.type.indexOf(value) === -1 ? 
            //adds value to filter and also updates checkbox to display check mark
            (this.filters.type.push(value) , this.typePicklist.forEach(item =>{
                if(item.value === value){item.checked = true;}})
            ) : 
            //removes value from filter and removes checkmark from checkbox
            (this.filters.type.splice(this.filters.type.indexOf(value),1) , this.typePicklist.forEach(item =>{
                if(item.value === value){item.checked = false;}})   
            )
        }       
        //sending update filter data to turoCarTile Component
        this.publishFilterinfo();
    }
    // Handles user input on vehice make dropdown list
    makeHandler(event){
        this.selectedMake = event.currentTarget.value;
        this.filters = {...this.filters, 'make':this.selectedMake}
        //sending update filter data to turoCarTile Component
        this.publishFilterinfo();
        //rearranges makePicklist so that selected value displays on top
        this.updateMakePicklist(this.selectedMake);
    }

    //opens filter modal
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
        else if(event.target.label === 'mobile'){
            this.mobileFilter = true;
        } 
    }

    //closes filter modal
    closeHandler(){
        this.isType = false;
        this.isMake = false;
        this.isPrice = false;
        this.mobileFilter = false;
    }


    //used to send filter object to other components.
    publishFilterinfo(){
        publish(this.context, filterMC, {filters:this.filters})
    }

    //rearranges makePicklist so that selected value displays on top
    updateMakePicklist(data){
        this.makePicklist.splice(this.makePicklist.indexOf(data),1)
        this.makePicklist.sort((a, b) => a.localeCompare(b))
        this.makePicklist.splice(0,0,data)
    }

    get make(){
        return this.filters.make
    }

    get filterButton(){
        if(this.resultTotal===0){
            return `No Results Available`
        }
        return `View ${this.resultTotal} Results`
    }
    get rate(){
        return this.filters.maxRate
    }

}