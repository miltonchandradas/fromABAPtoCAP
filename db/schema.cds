
namespace com.sap;
using { SalesOrderA2X } from '../srv/external/SalesOrderA2X.cds'; 
using { northwind } from '../srv/external/northwind.cds'; 

using {cuid} from '@sap/cds/common';

entity MappingCustomers : cuid {
    s4CustomerId   : String(100);
    nwCustomerId   : String(100);
    nwCustomerName : String(100);
}

entity S4SalesOrders      as
        projection on SalesOrderA2X.A_SalesOrder {
            SalesOrder            as salesOrder,
            SoldToParty           as customerId,
            SalesOrderDate        as salesOrderDate,
            TotalNetAmount        as totalAmount,
            OverallDeliveryStatus as status
        };

entity NorthwindCustomers as
        projection on northwind.Customers {
            CustomerID  as customerId,
            CompanyName as customerName,
            ContactName as contactName,
            Address     as address,
            City        as city,
            Country     as country,
            Phone       as phone
        };