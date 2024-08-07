// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

string tempvar = 'Enter_your_name_here';
System.debug('Hello World!');
System.debug('My name is ' + tempvar);

for(List<QuoteLineItem> quoList : [select id, Picture__c from QuoteLineItem])
{
    for(QuoteLineItem quot : quoList)
    {
        quot.Picture__c = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnGs89X2Tb5G8TtC-IxckC-jPZ6cDB0Kq9Gw&s';
    }
    update quoList;
}