using SalesService as service from '../../srv/service';

annotate service.Customers with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Customer Id',
                Value: customerId,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Customer Name',
                Value: customerName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Contact Name',
                Value: contactName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Address',
                Value: address,
            },
            {
                $Type: 'UI.DataField',
                Label: 'City',
                Value: city,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Country',
                Value: country,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Phone',
                Value: phone,
            },
            {
                $Type: 'UI.DataField',
                Label: 'S4 Customer Id',
                Value: s4CustomerId,
            },
        ],
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'Customer Details',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales Orders',
            ID    : 'SalesOrders',
            Target: 'orders/@UI.LineItem#SalesOrders',
        },
    ],
    UI.HeaderInfo: {
        TypeName: 'Customers',
        TypeNamePlural: 'Customers',
        
    },
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Customer Id',
            Value: customerId,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Customer Name',
            Value: customerName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Contact Name',
            Value: contactName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Address',
            Value: address,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Country',
            Value: country,
        },
    ],
);

annotate service.S4SalesOrders with @(
     UI.HeaderInfo: {
        TypeName: 'Orders',
        TypeNamePlural: 'Orders',
        
    },
    UI.LineItem #SalesOrders: [
    {
        $Type: 'UI.DataField',
        Value: customerId,
        Label: 'Customer Id',
    },
    {
        $Type: 'UI.DataField',
        Value: salesOrder,
        Label: 'Sales Order',
    },
    {
        $Type: 'UI.DataField',
        Value: salesOrderDate,
        Label: 'Sales Order Date',
    },
    {
        $Type: 'UI.DataField',
        Value: status,
        Label: 'Status',
        Criticality: criticality,
    },
    {
        $Type: 'UI.DataField',
        Value: totalAmount,
        Label: 'Total Amount',
    },
]);
