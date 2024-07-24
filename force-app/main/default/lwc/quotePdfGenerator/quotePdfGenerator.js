import { LightningElement, api, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/jsPDFLibrary';
import JSPDF_AUTOTABLE from '@salesforce/resourceUrl/jsAutotable';
import LOGO_IMAGE from '@salesforce/resourceUrl/company_logo'; // 'LogoImage' from static resource
import getQuoteData from '@salesforce/apex/QuoteController.getQuoteData'; 
import getQuoteLineItems from '@salesforce/apex/QuoteController.getQuoteLineItems'; 
import getQuoteSubtotal from '@salesforce/apex/QuoteController.getQuoteSubtotal';


export default class quotePdfGenerator extends LightningElement {
    @api recordId; // Quote record Id
    quoteData;
    jsPDFInitialized = false;

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
            this.quoteLineItems = data;
        } else if (error) {
            console.error('Error fetching quote line items', error);
        }
    }

    @wire(getQuoteSubtotal, { quoteId: '$recordId' })
    wiredQuoteSubtotal({ error, data }) {
        if (data) {
            this.subtotal = data.subtotal;
        } else if (error) {
            console.error('Error fetching quote subtotal', error);
        }
    }

    renderedCallback() {
        if (!this.jsPDFInitialized) {
            this.jsPDFInitialized = true;
            loadScript(this, JS_PDF)
                .then(() => loadScript(this, JSPDF_AUTOTABLE))
                .then(() => {
                    console.log('jsPDF and jsPDF-AutoTable libraries loaded successfully');
                })
                .catch((error) => {
                    console.error('Error loading jsPDF and jsPDF-AutoTable libraries', error);
                });
        }
    }


    
    handleGeneratePDF() {
        console.log('Generate PDF function called');
        if (this.jsPDFInitialized && this.quoteData) {
            const doc = new window.jspdf.jsPDF();

             /*****************Top of the doc********************/

            // Add Logo from static resource
            doc.addImage(LOGO_IMAGE, 'jpeg', 10, 10, 45, 45);

            // Company details (will replace with actual company details)
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Company Name', 150, 20);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text('Company Address Line 1', 150, 26);
            doc.text('Company Address Line 2', 150, 32);
            doc.text('Phone: 123-456-7890', 150, 38);
            doc.text('Email: info@company.com', 150, 44);

            // Add line with the word "Estimate" in the middle
            doc.line(10, 60, 200, 60);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('Estimate', 100, 65, { align: 'center' });
            doc.line(10, 70, 200, 70);

            // Add Quote Information
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Quote Number: ${this.quoteData.QuoteNumber}`, 10, 80);
            doc.text(`Kind Attention: ${this.quoteData.ContactId}`, 130, 80);
            doc.text(`Phone: ${this.quoteData.Phone}`, 130, 90);
            doc.text(`Estimate Date: ${this.quoteData.Estimate_Date__c}`, 10, 90);


            /*****************1st Table of the doc********************/

                       // Set up table headers and data
            const addressTableHeaders = [['Bill To', 'Ship To']];
            const addressTableBody = [
                [
                    `${this.quoteData.BillingName}\n${this.quoteData.BillingStreet}\n${this.quoteData.BillingCity},\n${this.quoteData.BillingState},\n${this.quoteData.BillingCountry}, ${this.quoteData.BillingPostalCode}`,
                    `${this.quoteData.ShippingName}\n${this.quoteData.ShippingStreet}\n${this.quoteData.ShippingCity}\n${this.quoteData.ShippingState},\n${this.quoteData.ShippingCountry}, ${this.quoteData.ShippingPostalCode}`
                ]
            ];
            const startYForAddTable =100;
            doc.autoTable({
                head: addressTableHeaders,
                body: addressTableBody,
                startY: startYForAddTable,
                theme: 'grid', // 'striped', 'plain' are also options
                columnStyles: {
                    0: { fontStyle: 'normal', textColor: [0, 0, 0], cellWidth : 90 },       //{ 2: { cellWidth: 90 } },
                    1: { fontStyle: 'normal', textColor: [0, 0, 0], cellWidth : 90 }
                },
    
                headerStyles: {
                    fillColor: '#0077b3', 
                    textColor: '#ffffff', 
                    fontSize: 11,
                    font: 'Helvetica',
                    fontStyle: 'bold',     
                    lineWidth: 0.3,
                    lineColor: '#000000',
                    halign: 'center'
                },
                bodyStyles: {
                    fillColor: '#ffffff', 
                    textColor: '#000000', 
                    overflow: 'linebreak',
                    fontSize: 11,
                    font: 'Helvetica',
                    fontStyle: 'normal',
                    lineWidth: 0.3,
                    lineColor: '#000000',
                    cellPadding: 5,
                    valign: 'middle',
                    halign: 'left'
                },
                margin: { left: 15, right: 15 },
                didDrawCell: function (data) {
                    // Draw borders
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
                },
                tableLineColor: '#000000',
                tableLineWidth: 0.3,
                tableLineStyle: 'solid'
            });


             /*****************2nd Table of the doc********************/
            let startYForItemTable = doc.autoTable.previous.finalY + 10; 

            const itemTableHeaders  = [['#', 'Item and Description','HSN/SAC', 'Qty','Rate(INR)','IGST%','Amount']];

            const itemTableBody = this.quoteLineItems.map((item, index) => [
                index + 1,
                item.Product2.Name,
                '',              // Place for HSN/SAC
                item.Quantity,
                item.UnitPrice,
                item.Discount,
                item.TotalPrice
            ]);

            doc.autoTable({
                head: itemTableHeaders,
                body: itemTableBody,
                startY: startYForItemTable,
                theme: 'grid', // 'striped', 'plain' are also options
                columnStyles: { 7: { cellWidth: 80 } },
                headerStyles: {
                    fillColor: '#0077b3', 
                    textColor: '#ffffff', 
                    fontSize: 11,
                    font: 'Helvetica',
                    fontStyle: 'bold',     
                    lineWidth: 0.3,
                    lineColor: '#000000',
                    halign: 'center'
                },
                bodyStyles: {
                    fillColor: '#ffffff',
                    textColor: '#000000',
                    overflow: 'linebreak',
                    fontSize: 11,
                    font: 'Helvetica',
                    fontStyle: 'normal',
                    lineWidth: 0.3,
                    lineColor: '#000000',
                    valign: 'middle',
                    halign: 'left'
                },
                margin: { left: 15, right: 15 },
                didDrawCell: function (data) {
                    // for borders
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
                },
                tableLineColor: '#000000',
                tableLineWidth: 0.3,
                tableLineStyle: 'solid'
            });
            console.log('pdf middle');
        /*****************Bottom of the doc********************/

        // Calculate startY for the right-side content
        const startYForRightSide = Math.max(startYForAddTable, startYForItemTable) + 33;

        // Calculate CGST, SGST/IGST, and Total 
        const cgstRate = 9; 
        const sgstOrIgstRate = 9; 
        const cgst = (this.subtotal * cgstRate) / 100;
        const sgstOrIgst = (this.subtotal * sgstOrIgstRate) / 100;
        const total = this.subtotal + cgst + sgstOrIgst;
        //const totalInWords = this.convertNumberToWords(total);

        // Right side content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0); 
        doc.text(`Subtotal: ${this.subtotal}`, 150, startYForRightSide);
        doc.text(`CGST(9%): ${cgst}`, 150, startYForRightSide + 6);
        doc.text(`SGST(9%): ${sgstOrIgst}`, 150, startYForRightSide + 12);

        // Draw lines below subtotal, CGST, SGST, and total
        doc.line(150, startYForRightSide + 15, 200, startYForRightSide + 15); // Line below SGST
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total: ${total}`, 150, startYForRightSide + 20);
        doc.line(150, startYForRightSide + 23, 200, startYForRightSide + 23); // Line below Total

        // Total in words
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Total in words: INR only', 150, startYForRightSide + 26);

            
        // Left side - Terms & Conditions
        const startYForLeftSide = Math.max(startYForAddTable, startYForItemTable) + 33;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Terms & Conditions', 10, startYForLeftSide);

        // Content under Terms & Conditions
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        // Adjusting line height for better readability
        const lineHeight = 6; 
        doc.setLineHeightFactor(lineHeight / doc.internal.scaleFactor);    
 
        doc.text('Payment Terms:', 10, startYForLeftSide + 6, { align: 'left' });
        doc.text('100% Advance along with PO', 40, startYForLeftSide + 6, { align: 'left' });

        doc.text('Price:', 10, startYForLeftSide + 12, { align: 'left' });
        doc.text('Ex-works Puducherry-India', 40, startYForLeftSide + 12, { align: 'left' });

        doc.text('P & F:', 10, startYForLeftSide + 18, { align: 'left' });
        doc.text('3% Extra', 40, startYForLeftSide + 18, { align: 'left' });

        doc.text('Quotation Validity:', 10, startYForLeftSide + 24, { align: 'left' });
        doc.text('30 days', 40, startYForLeftSide + 24, { align: 'left' });

        doc.text('Freight:', 10, startYForLeftSide + 30, { align: 'left' });
        doc.text('Extra as actual', 40, startYForLeftSide + 30, { align: 'left' });

        doc.text('Delivery Period:', 10, startYForLeftSide + 36, { align: 'left' });
        doc.text('10 days from the date of technical & commercial clear PO', 40, startYForLeftSide + 36, { align: 'left' });

        // Reset line height factor to default
        doc.setLineHeightFactor(1.15); // Default value

                /*****************Save the doc********************/
            
            // Save the PDF and open it in a new tab
            const pdfOutput = doc.output('blob');
            const pdfURL = URL.createObjectURL(pdfOutput);
            window.open(pdfURL);
        } else {
            console.error('jsPDF library not initialized or Quote data not loaded');
        }
    }
        
}
