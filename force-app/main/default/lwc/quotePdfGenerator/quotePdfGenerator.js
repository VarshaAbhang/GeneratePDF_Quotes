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

        doc.addPage();
        const img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnGs89X2Tb5G8TtC-IxckC-jPZ6cDB0Kq9Gw&s';
        const base64Image =  "data:image/jpeg;base64,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";
        doc.addImage(base64Image, 'JPEG', 30, 40, 20, 20); 
        console.log('print imag succesfully');     

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

        /*convertImgToBase64(url, callback) {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Handle CORS
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const base64String = canvas.toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
                callback(base64String);
            };
            img.onerror = (error) => {
                console.error('Error loading image:', error);
                callback(null);
            };
            img.src = url;
        }

        async getBase64Image(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error('Error fetching image:', error);
                return '';
            }
        }*/
            /*****************2nd Table of the doc********************/
/*            let startYForItemTable = doc.autoTable.previous.finalY + 10;

            const itemTableHeaders = columns.map(col => col.label);

            const itemTableBody = await Promise.all(this.quoteLineItems.map(async (item, index) => {
                const base64Image = item.Picture__c ? await this.getBase64Image(item.Picture__c) : '';
                return [
                    index + 1,
                    item.Product2.Name,
                    '',
                    item.Quantity,
                    item.UnitPrice,
                    item.Discount,
                    item.TotalPrice,
                    base64Image
                ];
            }));
            console.log('before 2nd table ');

            doc.autoTable({
                head: [itemTableHeaders],
                body: itemTableBody,
                startY: startYForItemTable,
                theme: 'grid',
                columnStyles: { 7: { cellWidth: 40 } },
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
                didDrawCell: (data) => {
                    if (data.column.index === 7 && data.cell.raw) {
                        const imgData = data.cell.raw;
                        doc.addImage(imgData, 'JPEG', data.cell.x, data.cell.y, 40, 40); // Adjust dimensions as needed
                        console.log('data : ', data.cell.raw);
                    }
                },
                tableLineColor: '#000000',
                tableLineWidth: 0.3,
                tableLineStyle: 'solid'
            });
            console.log('print 2nd table succesfully');*/