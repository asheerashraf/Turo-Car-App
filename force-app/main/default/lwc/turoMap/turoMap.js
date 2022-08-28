import { LightningElement, wire } from 'lwc';
import {APPLICATION_SCOPE, subscribe, unsubscribe, MessageContext} from 'lightning/messageService';
import carMapMC from '@salesforce/messageChannel/carMap__c';


export default class Maps extends LightningElement {

    @wire(MessageContext)
    context;
    
    userCity;
    sub;

    zoomLevel=12;
    listView = 'visible';
    mapMarkers3 = []
    /* SAMPLE DATA
    mapMarkers = [
        {
            location: {
                City: 'Chicago',
                Country: 'USA',
                PostalCode: '60613',
                State: 'IL',
                Street: '3950 N Lake Shore Dr',
            },
            value: 'Home',
            title: '3950 N Lake Shore Dr, Chicago, Illinois, 60613',
        
            icon: 'standard:account',
        },
        {
            location: {
                City: 'Denver',
                Country: 'USA',
                PostalCode: '',
                State: 'CO',
                Street: '',
            },
        },
        {
            location: {
                City: 'Chicago',
                Country: 'USA',
                PostalCode: '60613',
                State: 'IL',
                Street: '3657 N Pine Grove Ave',
            },
            value: 'Gym',
            title: 'FFC Gym',
            description:
                'Asheer Workouts here', //escape the apostrophe in the string using &#39;
            icon: 'standard:account',
        },
        {
            location: {
                City: 'Chicago',
                Country: 'USA',
                PostalCode: '60613',
                State: 'IL',
                Street: '3640 N Halsted St',
            },
            value: 'Grocery',
            title: 'Whole Food',
            description:
                'Asheer grocery shops here', //escape the apostrophe in the string using &#39;
            icon: 'standard:account',
        },  {
            location: {
                City: 'Chicago',
                Country: 'USA',
                PostalCode: '60605',
                State: 'IL',
                Street: '1300 S DuSable Lake Shore Dr',
            },
            value: 'Grocery',
            title: 'Whole Food',
            description:
                'Asheer grocery shops here', //escape the apostrophe in the string using &#39;
            icon: 'standard:account',
        },
        {
            location: {
                City: 'Chicago',
                Country: 'USA', 
                PostalCode: '60601',
                State: 'IL',
                Street: '171 N Clark St',
            },
            value: 'Grocery',
            title: 'Whole Food',
            description:
                'Asheer grocery shops here', //escape the apostrophe in the string using &#39;
            icon: 'standard:account',
        }
    ];
    */
    mapOptions = {
        disableDefaultUI: true,
    };

    map2 = [];

    connectedCallback(){
        this.subscribeMessage();
        
        //receives city value from user input on homepage city field
        this.userCity = sessionStorage.getItem("city");
    }
    
    subscribeMessage(){
        //receives car data from turoCarTile component
        this.sub = subscribe(this.context, carMapMC, (message)=>{this.handleMessage(message)}, {scope: APPLICATION_SCOPE});
    }

    renderedCallback(){
        //seems irrelevant.
        this.doc();
    }

    //receives car data from turoCarTile component
    handleMessage(data){
        //transforming data into the correct format.
        this.mapMarkers3 =  data.cars.map(item => {
            return {
                //Displays location of cars
                location: {
                    City: item.Car_Location__r.City__c || '',
                    PostalCode: item.Car_Location__r.Zip_Code__c || '',
                    State: item.Car_Location__r.State__c || '',
                    Street: item.Car_Location__r.Name || '',
                    Country: item.Car_Location__r.Country__c || '',
                },
                //Car info when user selects individual pin on map
                title: `${item.Name}`,
                description: `Daily Rate: $${item.Daily_Rate__c}<br>${item.Car_Location__r.Name},<br>${item.Car_Location__r.City__c}, ${item.Car_Location__r.State__c}, ${item.Car_Location__r.Zip_Code__c}`,
            }
        })


        //if no car results are found
        if(this.mapMarkers3.length === 0 ){
            this.mapMarkers3.push({
                location:{
                    City: this.userCity
                },
                title: `No Cars Found`
            })
        }
    }

    disconnectedCallback(){
        unsubscribe(this.sub)
        this.sub = null
    }

    mapMarkers2(data){
       this.map2 = data.map(item=>{
        return {
                location: {
                    City: item.BillingCity || '',
                    PostalCode: item.BillingPostalCode || '',
                    State: item.BillingState || '',
                    Street: item.BillingStreet || '',
                    Country: item.BillingCountry || '',
                },
                value: item.Id,
                title: item.Name,
            }
        }) 
        
        this.valueHandler = this.map2.length && this.map2[0].value
    }

    valueHandler
    selectHandler(event){
        this.valueHandler = event.detail.selectedMarkerValue
    }


    //seems irrelevant. Function called on rendercallback?
    doc(){
        let el = this.template.querySelector('--none')
    }

}