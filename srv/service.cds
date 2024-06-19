using {SalesOrderA2X} from './external/SalesOrderA2X.cds';
using {northwind} from './external/northwind.cds';
using {com.sap as my} from '../db/schema';

@path: '/service/fromABAPtoCAPSvcs'
service SalesService {

    @readonly
    entity MappingCustomers   as projection on my.MappingCustomers;

    @readonly
    entity S4SalesOrders      as
        projection on SalesOrderA2X.A_SalesOrder {
            SalesOrder            as salesOrder,
            SoldToParty           as customerId,
            SalesOrderDate        as salesOrderDate,
            TotalNetAmount        as totalAmount,
            OverallDeliveryStatus as status
        };

    @readonly
    entity NorthwindCustomers as
        projection on northwind.Customers {
            CustomerID  as customerId,
            CompanyName as companyName,
            ContactName as contactName,
            Address     as address,
            City        as city,
            Country     as country,
            Phone       as phone
        };
}

annotate SalesService with @requires: ['authenticated-user'];
