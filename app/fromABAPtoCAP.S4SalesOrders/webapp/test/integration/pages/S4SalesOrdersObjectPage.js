sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'fromABAPtoCAP.S4SalesOrders',
            componentId: 'S4SalesOrdersObjectPage',
            contextPath: '/Customers/orders'
        },
        CustomPageDefinitions
    );
});