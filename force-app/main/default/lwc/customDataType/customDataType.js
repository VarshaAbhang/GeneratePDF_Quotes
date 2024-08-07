import { LightningElement } from 'lwc';
import LightningDataTable from 'lightning/datatable';
import customImage from './customImage.html';

export default class CustomDataType extends LightningDataTable {
    static customTypes = {
        customImage: {
            template: customImage,
            standardCellLayout: true, 
            typeAttributes: ["PictureURL"] 
        }

        // customImageDisplay:
        // {
        //     template: customImageDisplay,
        //     standardCellLayout: true, 
        //     typeAttributes: ["ImageDisplay"] 
        // }
        
    };
}
