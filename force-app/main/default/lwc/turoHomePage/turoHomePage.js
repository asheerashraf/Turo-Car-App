import { LightningElement } from 'lwc';
import turoBanner from '@salesforce/resourceUrl/turoBanner';
import turoBannerMobile from '@salesforce/resourceUrl/turoBannerMobile';

export default class TuroHomePage extends LightningElement {
    banner = turoBanner;
    mobileBanner = turoBannerMobile
    dateSet = false;
    today
    selectedFromDate = null;
    selectedUntilDate = null;
    city;
    timeout;
    
    //Calling function to set current date time 
    connectedCallback(){
        //if current date time is already set, then skip
        if(this.dateSet){
            return;
        }
        this.setDate();
        this.dateSet = true;
    }

    //Sets current date time. Used in 'From' and 'Until' fields on homepage
    setDate(){
        let date = new Date().toLocaleDateString('en-ca');
        this.today = `${date}T00:00`
    }

    //Handles user input for 'From' date time field
    fromDateHandler(event){
        this.selectedFromDate = event.target.value;
    }

    //Handles user input for 'Until' date time field
    untilDateHandler(event){
        this.selectedUntilDate = event.target.value;
    }

    //Handles user input for 'City' text field
    cityHandler(event){
        this.city = event.target.value;
        console.log('city',this.city)
    }

    //stores user city input in browser storage and redirects to search results page. 
    searchButton(){
        sessionStorage.setItem("city",`${this.city}`);

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            window.location.href="/turo/search-results";
        }, 500);
        
    }

    //gets date time to display on 'From' field
    get fromDate(){
        return this.today;
    }

    //gets date time to display on 'Until' field
    get toDate(){
        if(this.selectedFromDate == null){
            return this.today;
        }
        return this.selectedFromDate;
    }

    disconnectedCallback() {
        clearTimeout(this.timeout);
    }

}