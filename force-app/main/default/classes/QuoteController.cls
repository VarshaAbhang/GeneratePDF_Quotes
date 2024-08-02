// public with sharing class QuoteController
// {
//     @AuraEnabled(cacheable=true)
//     public static Quote getQuoteData(Id quoteId) 
//     {
//         return [SELECT QuoteAccountId, QuoteNumber, Name  FROM Quote WHERE Id = :quoteId];   /* Add other fields as needed */
//     }

public with sharing class QuoteController {

    @AuraEnabled(cacheable=true)
    public static Quote getQuoteData(Id quoteId) {
        // Check if the current user has read access to the Quote object
        if (!Schema.sObjectType.Quote.isAccessible()) {
            throw new System.NoAccessException();
        }

        try {
            // Perform the query including LastModifiedDate
            return [SELECT Id, 
                           QuoteNumber, 
                           Name, 
                           QuoteToName, 
                           QuoteToStreet, 
                           QuoteToCity,
                           BillingName, 
                           BillingStreet, 
                           BillingCity,
                           BillingCountry, 
                           BillingState,   
                           BillingPostalCode, 
                           ShippingName, 
                           ShippingStreet, 
                           ShippingCity,
                           ShippingCountry, 
                           ShippingState,   
                           ShippingPostalCode, 
                           Email,
                           Phone
                    FROM Quote 
                    WHERE Id = :quoteId];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Quote data: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<QuoteLineItem> getQuoteLineItems(Id quoteId) {
        // Check if the current user has read access to the QuoteLineItem object
        if (!Schema.sObjectType.QuoteLineItem.isAccessible()) {
            throw new System.NoAccessException();
        }

        try {
            // Perform the query to get the QuoteLineItems related to the Quote
            return [SELECT Id, 
                           Product2.Name, 
                           Description, 
                           Quantity, 
                           UnitPrice, 
                           Discount, 
                           TotalPrice,
                           //Image_URL__c,
                           Image_Display__c
                    FROM QuoteLineItem 
                    WHERE QuoteId = :quoteId];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Quote Line Items: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static AggregateResult getQuoteSubtotal(Id quoteId) {
        AggregateResult[] results = [SELECT SUM(TotalPrice) subtotal
                                     FROM QuoteLineItem
                                     WHERE QuoteId = :quoteId];
        return results.isEmpty() ? null : results[0];
    }
}
