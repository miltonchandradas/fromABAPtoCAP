sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'fromABAPtoCAP/S4SalesOrders/test/integration/FirstJourney',
		'fromABAPtoCAP/S4SalesOrders/test/integration/pages/CustomersList',
		'fromABAPtoCAP/S4SalesOrders/test/integration/pages/CustomersObjectPage',
		'fromABAPtoCAP/S4SalesOrders/test/integration/pages/S4SalesOrdersObjectPage'
    ],
    function(JourneyRunner, opaJourney, CustomersList, CustomersObjectPage, S4SalesOrdersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('fromABAPtoCAP/S4SalesOrders') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCustomersList: CustomersList,
					onTheCustomersObjectPage: CustomersObjectPage,
					onTheS4SalesOrdersObjectPage: S4SalesOrdersObjectPage
                }
            },
            opaJourney.run
        );
    }
);