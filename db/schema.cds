using { SalesOrderA2X } from '../srv/external/SalesOrderA2X.cds'; 
namespace com.sap;

using {cuid} from '@sap/cds/common';

entity MappingCustomers : cuid {
    s4CustomerId   : String(100);
    nwCustomerId   : String(100);
    nwCustomerName : String(100);
}