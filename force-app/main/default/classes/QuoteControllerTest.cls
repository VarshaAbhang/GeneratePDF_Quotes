// // public with sharing class QuoteControllerTest {
// //     public QuoteControllerTest() {

// //     }
// // }




// @isTest
public class QuoteControllerTest {}

//     @isTest
//     static void testGetQuoteData() {
//         // Create a test Quote record
//         Quote testQuote = new Quote(
//             Name = 'Test Quote',
//             QuoteNumber = 'Q-001',
//             QuoteToName = 'Test Customer',
//             BillingName = 'Test Billing Company',
//             ShippingName = 'Test Shipping Company',
//             Email = 'test@example.com',
//             Phone = '123-456-7890',
//             BillingStreet = '123 Test St',
//             BillingCity = 'Test City',
//             BillingCountry = 'Test Country',
//             BillingState = 'Test State',
//             BillingPostalCode = '12345',
//             ShippingStreet = '456 Test Ave',
//             ShippingCity = 'Shipping City',
//             ShippingCountry = 'Shipping Country',
//             ShippingState = 'Shipping State',
//             ShippingPostalCode = '54321'
//         );
//         insert testQuote;

//         // Call the getQuoteData method
//         Quote result = QuoteController.getQuoteData(testQuote.Id);

//         // Verify the returned data
//         System.assertEquals('Test Quote', result.Name);
//         System.assertEquals('Q-001', result.QuoteNumber);
//         System.assertEquals('Test Customer', result.QuoteToName);
//         System.assertEquals('Test Billing Company', result.BillingName);
//         System.assertEquals('Test Shipping Company', result.ShippingName);
//         System.assertEquals('test@example.com', result.Email);
//         System.assertEquals('123-456-7890', result.Phone);
//         System.assertEquals('123 Test St', result.BillingStreet);
//         System.assertEquals('Test City', result.BillingCity);
//         System.assertEquals('Test Country', result.BillingCountry);
//         System.assertEquals('Test State', result.BillingState);
//         System.assertEquals('12345', result.BillingPostalCode);
//         System.assertEquals('456 Test Ave', result.ShippingStreet);
//         System.assertEquals('Shipping City', result.ShippingCity);
//         System.assertEquals('Shipping Country', result.ShippingCountry);
//         System.assertEquals('Shipping State', result.ShippingState);
//         System.assertEquals('54321', result.ShippingPostalCode);
//     }

//     @isTest
//     static void testGetQuoteLineItems() {
//         // Create a test Quote record
//         Quote testQuote = new Quote(
//             Name = 'Test Quote',
//             QuoteNumber = 'Q-001'
//         );
//         insert testQuote;

//         // Create test Quote Line Items
//         QuoteLineItem testLineItem1 = new QuoteLineItem(
//             QuoteId = testQuote.Id,
//             Product2Id = 'Product2Id1', // Replace with an actual Product2Id
//             Quantity = 2,
//             UnitPrice = 100,
//             Discount = 10
//         );
//         QuoteLineItem testLineItem2 = new QuoteLineItem(
//             QuoteId = testQuote.Id,
//             Product2Id = 'Product2Id2', // Replace with an actual Product2Id
//             Quantity = 3,
//             UnitPrice = 150,
//             Discount = 15
//         );
//         insert new List<QuoteLineItem>{ testLineItem1, testLineItem2 };

//         // Call the getQuoteLineItems method
//         List<QuoteLineItem> result = QuoteController.getQuoteLineItems(testQuote.Id);

//         // Verify the returned data
//         System.assertEquals(2, result.size());
//         System.assertEquals('Product2Id1', result[0].Product2Id);
//         System.assertEquals(2, result[0].Quantity);
//         System.assertEquals(100, result[0].UnitPrice);
//         System.assertEquals(10, result[0].Discount);
//         System.assertEquals('Product2Id2', result[1].Product2Id);
//         System.assertEquals(3, result[1].Quantity);
//         System.assertEquals(150, result[1].UnitPrice);
//         System.assertEquals(15, result[1].Discount);
//     }

//     @isTest
//     static void testGetQuoteSubtotal() {
//         // Create a test Quote record
//         Quote testQuote = new Quote(
//             Name = 'Test Quote',
//             QuoteNumber = 'Q-001'
//         );
//         insert testQuote;

//         // Create test Quote Line Items
//         QuoteLineItem testLineItem1 = new QuoteLineItem(
//             QuoteId = testQuote.Id,
//             TotalPrice = 200
//         );
//         QuoteLineItem testLineItem2 = new QuoteLineItem(
//             QuoteId = testQuote.Id,
//             TotalPrice = 300
//         );
//         insert new List<QuoteLineItem>{ testLineItem1, testLineItem2 };

//         // Call the getQuoteSubtotal method
//         AggregateResult result = QuoteController.getQuoteSubtotal(testQuote.Id);

//         // Verify the returned subtotal
//         System.assertEquals(500, result.get('subtotal'));
//     }
// }
