using {com.sap as my} from '../db/schema';

@path: '/service/fromABAPtoCAPSvcs'
service SalesService {

    annotate Customers with @restrict :
    [
        { grant : [ '*' ], to : [ 'Manager' ] },
        { grant : [ 'READ' ], to : [ 'Support' ] }
    ];

    @readonly
    entity MappingCustomers   as projection on my.MappingCustomers;

    @readonly
    entity Customers   as projection on my.Customers;

    @readonly
    entity S4SalesOrders      as projection on my.S4SalesOrders;

    @readonly
    entity NorthwindCustomers as projection on my.NorthwindCustomers;
}

annotate SalesService with @requires: ['authenticated-user'];
