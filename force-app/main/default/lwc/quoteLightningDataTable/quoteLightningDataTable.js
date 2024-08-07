import { LightningElement, api, track, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import getQuoteData from '@salesforce/apex/QuoteController.getQuoteData'; 
import getQuoteLineItems from '@salesforce/apex/QuoteController.getQuoteLineItems'; 

import CustomDataType from 'c/customDataType'; // Import your custom data type

const columns = [
    { label: '#', fieldName: 'rowNumber' },
    { label: 'Item and Description', fieldName: 'Name', type: 'Text' },
    { label: 'HSN/SAC', fieldName: 'HSN_SAC__c', type: 'text' },
    { label: 'Qty', fieldName: 'Quantity', type: 'number' },
    { label: 'Rate(INR)', fieldName: 'UnitPrice', type: 'currency' },
    { label: 'Discount (%)', fieldName: 'Discount', type: 'Percent' },
    { label: 'Amount', fieldName: 'TotalPrice', type: 'currency' },
    { 
        label: 'Image', 
        type: 'customImage', // Use custom data type
        typeAttributes: { 
            PictureURL: { fieldName: 'Picture__c' } 
        }, 
        cellAttributes: { alignment: 'center' }
    }
    // { 
    //     label: 'ImageDisplay', 
    //     type: 'customImageDisplay', // Use custom data type
    //     typeAttributes: { 
    //         ImageDisplay: { fieldName: 'Image_Display__c' } 
    //     }, 
    //     cellAttributes: { alignment: 'center' }
    // }
];


export default class QuoteLightningDataTable extends LightningElement {

    @api recordId; 
    @track quoteData;
    @track quoteLineItems = [];
    @track subtotal;
    columns = columns;

    @wire(getQuoteData, { quoteId: '$recordId' })
    wiredQuote({ error, data }) {
        if (data) {
            this.quoteData = data;
        } else if (error) {
            console.error('Error fetching quote data', error);
        }
    }

    @wire(getQuoteLineItems, { quoteId: '$recordId' })
    wiredQuoteLineItems({ error, data }) {
        if (data) {
            this.quoteLineItems = data.map((item, index) => ({
                ...item,
                Name: item.Product2.Name,
                rowNumber: index + 1 
            }));
            console.log('Fetched Quote Line Items:', data);
        } else if (error) {
            console.error('Error fetching quote line items', error);
        }
    }





    
}