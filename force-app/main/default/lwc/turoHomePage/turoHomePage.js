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
    

    renderedCallback(){
        console.log('render')
        if(this.dateSet){
            return;
        }
        this.setDate();
        this.dateSet = true;
    }

    setDate(){
        let date = new Date().toLocaleDateString('en-ca');
        this.today = `${date}T00:00`
    }

    fromDateHandler(event){
        this.selectedFromDate = event.target.value;
    }

    untilDateHandler(event){
        this.selectedUntilDate = event.target.value;
    }

    cityHandler(event){
        this.city = event.target.value;
        console.log('city',this.city)
    }

    searchButton(){
        sessionStorage.setItem("city",`${this.city}`);

        setTimeout(() => {
            window.location.href="/turo/search-results";
        }, 500);
        
    }

    get fromDate(){
        return this.today;
    }

    get toDate(){
        if(this.selectedFromDate == null){
            return this.today;
        }
        return this.selectedFromDate;
    }
    
}