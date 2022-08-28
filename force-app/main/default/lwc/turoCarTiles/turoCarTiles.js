import { LightningElement, wire } from 'lwc';
import fetchCars from '@salesforce/apex/carsController.fetchCars';
import filterMC from '@salesforce/messageChannel/carFilter__c';
import resultMC from '@salesforce/messageChannel/resultTotal__c';
import {APPLICATION_SCOPE, subscribe, unsubscribe, MessageContext, publish} from 'lightning/messageService';
import carMC from '@salesforce/messageChannel/selectedCar__c';
import carMapMC from '@salesforce/messageChannel/carMap__c';
import thumbs_Up from '@salesforce/resourceUrl/thumbsup';
import No_Results from '@salesforce/resourceUrl/noResults';

export default class CarTileList extends LightningElement {
thumbImage = thumbs_Up
noresults = No_Results
myTimeout
cars=[] //stores records from Car__c object
carIds=[] //stores Id of each car record from Car__c object
contentDocumentsLink=[] //stores ContentDocumentLink records
contentVersion=[] //stores contentVersion records
contentDocIds=[]
images=[];
selectedCar=[] //stores info of car record when user selects a car tile.

//FILTER values passed into apex Car Controller
searchTerm = '' //initiliziating with null because it is passed into @wire service
maxRate = null //initiliziating with null because it is passed into @wire service
filteredMake = [] //initiliziating with null because it is passed into @wire service
filteredType = [] //initiliziating with null because it is passed into @wire service
filteredCity = '' //initiliziating with null because it is passed into @wire service

@wire(MessageContext)
context;

sub;

connectedCallback(){
    this.subscribeMessage();

    //receives city user types on home page city search box
    this.filteredCity = sessionStorage.getItem("city");
    console.log('filter city is', this.filteredCity)
}

//Subcribing to event from turo2Filter component
subscribeMessage(){
    this.sub = subscribe(this.context, filterMC, (message)=>{this.handleMessage(message)}, {scope: APPLICATION_SCOPE});
}

//Stores data received from turo2Filter component published event
handleMessage(data){
    this.maxRate = data.filters.maxRate;
    this.searchTerm = data.filters.searchKey
    this.filteredType = data.filters.type
    this.filteredMake = data.filters.make
}

disconnectedCallback(){
    //unsubscribes from LMS
    unsubscribe(this.sub)
    this.sub = null

    //clearing setInterval timeout
    clearTimeout(this.myTimeout);

    //clears sessionstorage of city input
    sessionStorage.removeItem("city");

}


//apex controller queries car records based on filter criteria set by user
@wire(fetchCars, {search: '$searchTerm', rate: '$maxRate', 
                    type: '$filteredType' , make: '$filteredMake', userCity: '$filteredCity' })
    carHandler({data,error}){
        if(data){
            this.cars = data
            //Sending data to turoMap component
            this.publishGoogleMap(data)
            ////Sending data to turo2Filter component
            this.publishResultTotal(data)
        }
        if(error){
            console.error(error.message)
        }
    }

//when user clicks on individual car tiles
tileHandler(event){
    const selectedCarId = (event.currentTarget.dataset.value)
    this.selectedCar = this.cars.filter(item=>{
        if(item.Id === selectedCarId){
            return item
        }
    })
    console.log('car',this.selectedCar )
    this.publishCarinfo()
}
    
    ////Sends car data to turoMap component so that it can be displayed on map
    publishGoogleMap(){
        publish(this.context, carMapMC, {cars: this.cars})
    }

    //when user selects a car, it publishes selected car data
    publishCarinfo(){
        publish(this.context, carMC, {car: this.selectedCar})
    }
    //Sends how many vehicles found in search result to turo2Filter component
    publishResultTotal(){
        publish(this.context, resultMC, {results: this.cars.length})
    }

    //used to display no results found if car search results is null
    get noResults(){
        if(this.cars.length === 0){
                return true;
        }
        return false;
    }

}








/* CODE WHEN IMAGES WERE STORED IN RECORD FILES    
    //calls apex controller to query ContentDocumentLink records linked to car record Ids
@wire(getContentDocumentIds, {recordIds: '$carIds' })
    contentDocHandler({data,error}){
        if(data){
            this.contentDocumentsLink = data
            console.log('contentdoclink', data)

            //Stores ContentDocumentIds into a variable
            this.getContentDocumentIds(this.contentDocumentsLink)
            //removing Id property from ContentDocumentLink records
            this.removeContentDocumentLinkIds(this.contentDocumentsLink)

            //calls apex controller to query ContentDocumentVersion records
            getContentVersionIds({ contentIds: this.contentDocIds } )
                .then((result)=>{
                    console.log('result versionId', result)
                    this.formatVersion(result);

                    this.mergeContentObjects(this.contentDocumentsLink ,this.contentVersion)
                })
                .catch((error)=>{
                    console.error('error versionId', error)
                })
        }
        if(error){
            console.error(error)
        }
    }

//Stores Car Ids into variable which will be used to fetch content files linked to car records.
getCarIds(data){
    this.carIds = data.map(item=>{
        return item.Id;
    })
}

//Stores ContentDocumentIds into a variable which will be used to fetch ContentVersionIds
getContentDocumentIds(data){
    this.contentDocIds = data.map(item=>{
        return item.ContentDocumentId;
    })
}
//updating property names for Contentversion records
formatVersion(data){
    this.contentVersion = data.map(item=>{
        return {imageURL: '/sfc/servlet.shepherd/version/download/'+item.Id, VersionId: item.Id, ContentDocumentId: item.ContentDocumentId, Title: item.Title,}
    })
    console.log('format version', this.contentVersion)
}

//removing Id property from ContentDocumentLink records
removeContentDocumentLinkIds(data){
    //rename property name from Id --> ContentDocumentLinkId    
    this.contentDocumentsLink = data.map(item =>{
            return {ContentDocumentLinkId: item.Id, ContentDocumentId: item.ContentDocumentId, LinkedEntityId: item.LinkedEntityId }
        })
    
    this.contentDocumentsLink.forEach(item =>{
        delete item.ContentDocumentLinkId
    })
    console.log('deleted Id', this.contentDocumentsLink)
}

//merging content objects so that versionId and LinkedEntityId are together.
mergeContentObjects(link, version){
    const map = new Map();
    version.forEach(item => map.set(item.ContentDocumentId, item));
    
    //Merge array objects if contentDocumentId matches from both arrays.
    link.forEach((item) =>{
        if(map.has(item.ContentDocumentId)){
            map.set(item.ContentDocumentId, {...map.get(item.ContentDocumentId), ...item});
        }
    })
    let img = Array.from(map.values()); 

    //formatting combined contentDocument object to accquire only the needed properties
    this.images = img.map(item=>{
        return {imageURL: item.imageURL, LinkedEntityId: item.LinkedEntityId, Title: item.Title}
    })

    console.log('images', this.images)

    //adds first image content properties to car record
    this.addfirstImagestoCar(this.cars, this.images)
}

//adds first image content properties to car record
addfirstImagestoCar(cars, images){
    const map = new Map();
    cars.forEach(item => map.set(item.Id, item));
    
    //filtering to get the primary image for each car
    images = images.filter(item=>{
        if(item.Title === '1'){
            return item
        }
    })

    //Merge array objects if contentDocumentId matches from both arrays.
    images.forEach((item) =>{
        if(map.has(item.LinkedEntityId)){
            map.set(item.LinkedEntityId, {...map.get(item.LinkedEntityId), ...item});
        }
    })
    this.cars = Array.from(map.values()); 
    console.log('cars2', this.cars)
} 

*/
