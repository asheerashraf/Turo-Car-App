import { LightningElement, api } from 'lwc';

export default class ModalCarFilter extends LightningElement {
    @api leftPadding;
    paddingSet = false; //determines if modal padding has been set or not
    
    closeModal(){
        const evt = new CustomEvent('close');
        this.dispatchEvent(evt);
    }

    footerslotHandler(){
        const footerElement = this.template.querySelector('div.slds-modal__footer');
        if(footerElement){
            footerElement.classList.remove('slds-hide')
        }
    }

    headerslotHandler(){
        const footerElement = this.template.querySelector('div.slds-modal__header');
        if(footerElement){
            footerElement.classList.remove('remove-header')
        }
    }

    renderedCallback(){
        if(!this.paddingSet){
        let bodyStyles = this.template.host.style;
        bodyStyles.setProperty('--padding-left', this.leftPadding);
        this.paddingSet = true;
        }
    }

}