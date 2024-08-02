@isTest
public class QuoteControllerTest {

    @testSetup
    static void setup() {
        // Create a test Account
        Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;

        // Create a test Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            AccountId = testAccount.Id
        );
        insert testContact;

        // Create a test Quote
        Quote testQuote = new Quote(
            Name = 'Test Quote',
            //AccountId = testAccount.Id,
            Status = 'Draft',
            ExpirationDate = Date.today()  //  ExpirationDate as an example
        );
        insert testQuote;

        // Create test Products
        Product2 testProduct1 = new Product2(
            Name = 'Test Product 1',
            IsActive = true,
            Price__c = 100
        );
        insert testProduct1;

        // Query for the Custom Price Book
        List<Pricebook2> customPricebooks = [SELECT Id FROM Pricebook2 WHERE IsStandard=false LIMIT 1];

        if (!customPricebooks.isEmpty()) {
            Pricebook2 customPricebook = customPricebooks[0];

            // Create a Pricebook Entry for the product
            PricebookEntry standardPrice = new PricebookEntry(
                Product2Id = testProduct1.Id,
                UnitPrice = 100,
                Pricebook2Id = customPricebook.Id,
                IsActive = true
            );
            insert standardPrice;

        /*Pricebook2 standardPricebook = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];

        if (standardPricebook != null) {
            // Create a Pricebook Entry for the product in the standard price book
            PricebookEntry standardPrice = new PricebookEntry(
                Product2Id = testProduct1.Id,
                UnitPrice = 100,
                Pricebook2Id = standardPricebook.Id,
                IsActive = true
            );
            insert standardPrice;*/

            // Create test Quote Line Items
            QuoteLineItem testQuoteLineItem1 = new QuoteLineItem(
                QuoteId = testQuote.Id,
                Quantity = 2,
                UnitPrice = 50,
                PricebookEntryId = standardPrice.Id
            );
            insert testQuoteLineItem1;

            QuoteLineItem testQuoteLineItem2 = new QuoteLineItem(
                QuoteId = testQuote.Id,
                Quantity = 2,
                UnitPrice = 50,
                PricebookEntryId = standardPrice.Id
            );
            insert testQuoteLineItem2;
        } else {
            // Handle the case where no custom price book is found
            System.debug('No custom price book found. Skipping test setup.');
        }
    }

    @isTest
    static void testGetQuoteData() {
        // Retrieve the test Quote
        Quote testQuote = [SELECT Id FROM Quote LIMIT 1];

        // Test the getQuoteData method
        Test.startTest();
        Quote result = QuoteController.getQuoteData(testQuote.Id);
        Test.stopTest();
		
		System.debug('Test Quote Id: ' + result.Id);
        // Validate the result
        System.assertEquals(testQuote.Id, result.Id, 'The retrieved Quote Id should match the test Quote Id');
    }

     @isTest
    static void testGetQuoteLineItems() {
        // Retrieve the test Quote
        Quote testQuote = [SELECT Id FROM Quote LIMIT 1];

        // Test the getQuoteLineItems method
        Test.startTest();
        List<QuoteLineItem> quoteLineItems = QuoteController.getQuoteLineItems(testQuote.Id);
        Test.stopTest();

        // Validate the results
        System.assertEquals(2, quoteLineItems.size(), 'The number of retrieved Quote Line Items should be 2');
    }

    @isTest
    static void testGetQuoteSubtotal() {
        // Retrieve the test Quote
        Quote testQuote = [SELECT Id FROM Quote LIMIT 1];

        // Test the getQuoteSubtotal method
        Test.startTest();
        AggregateResult result = QuoteController.getQuoteSubtotal(testQuote.Id);
        Test.stopTest();

        // Validate the result
        Decimal subtotal = (Decimal)result.get('subtotal');
        System.assertEquals(200, subtotal, 'The subtotal of the Quote Line Items should be 200');
    }
}