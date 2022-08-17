import { LightningElement, track } from 'lwc';
import moment from '@salesforce/resourceUrl/moment';
import { loadScript } from 'lightning/platformResourceLoader';

export default class DatePicker extends LightningElement {
    lastClass;
    @track dateContext 
    @track selectedDate 
    @track dates = [];
    today

    connectedCallback(){
        Promise.all([
            loadScript(this, moment)
          ]).then(() => {
           this.loadActivities();
           console.log('moment lodaded success')
        });
    }

    loadActivities(){
        this.today = window.moment();
        this.dateContext = window.moment();
        this.selectedDate = window.moment();
    }
}