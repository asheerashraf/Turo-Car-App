import { LightningElement, wire, api } from 'lwc';
import fetchCars from '@salesforce/apex/carsController.fetchCars';
import getContentDocumentIds from '@salesforce/apex/contentDocumentLinkController.getContentDocumentIds';
import getContentVersionIds from '@salesforce/apex/contentDocumentLinkController.getContentVersionIds';
import filterMC from '@salesforce/messageChannel/carFilter__c';
import {APPLICATION_SCOPE, subscribe, unsubscribe, MessageContext, publish} from 'lightning/messageService';
import carMC from '@salesforce/messageChannel/selectedCar__c';


export default class CarTileList extends LightningElement {

cars=[] //stores records from Car__c object
carIds=[] //stores Id of each car record from Car__c object
contentDocumentsLink=[] //stores ContentDocumentLink records
contentVersion=[] //stores contentVersion records
contentDocIds=[]
images=[];
selectedCar=[] //stores info of car record when user selects a car tile.

searchTerm = ''; //initiliziating with null because it is passed into @wire service
maxRate = null; //initiliziating with null because it is passed into @wire service
filteredMake = [] //initiliziating with null because it is passed into @wire service
filteredType = [] //initiliziating with null because it is passed into @wire service



@wire(MessageContext)
context;
sub;

connectedCallback(){
    this.subscribeMessage();
}

subscribeMessage(){
    this.sub = subscribe(this.context, filterMC, (message)=>{this.handleMessage(message)}, {scope: APPLICATION_SCOPE});
}

handleMessage(data){
    this.maxRate = data.filters.maxRate;
    this.searchTerm = data.filters.searchKey
    this.filteredType = data.filters.type
    this.filteredMake = data.filters.make
}

disconnectedCallback(){
    unsubscribe(this.sub)
    this.sub = null
}


//I want to associate car record with a images property which will have contectdocId, versionId, title.
//image property will be an array of objects

//remove contentlink record Id.
//how to get all images into car record.

//why not manipulate the data contentdocumentlink and only send back version Id and title to client. 
//Rather than manipulate client side and call again and manipulate again.
//guess Im having fun time manipulating via javascript. Apex little rusty but worth tackling. 

content = [
    {recordId: '',
    images: [
        {ContentDocumentId: '0694W00000NECfWQAX', VersionId: '0684W00000NZzOlQAL', Title: '1'},
        {ContentDocumentId: '0694W000500NEC3QAX', VersionId: '0684W00000NZzOlQAL', Title: '2'},
        {ContentDocumentId: '0694W000500NEC3QAX', VersionId: '0684W00000NZzOKQA1', Title: '3'},
    ]
}]


image = '/sfc/servlet.shepherd/version/download/0684W00000NZzOKQA1' 

//calls apex controller to query car records
@wire(fetchCars, {search: '$searchTerm', rate: '$maxRate', type: '$filteredType' , make: '$filteredMake' })
    carHandler({data,error}){
        console.log('wire called')
        if(data){
            this.cars = data
            //Stores Car Ids into variable
            this.getCarIds(this.cars);
            console.log('wire data results')
        }
        if(error){
            console.log('wire data error')
            console.error(error.message)
        }
    }
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

    //used to send selected car object to other components.
    publishCarinfo(){
        publish(this.context, carMC, {car: this.selectedCar})
    }


}