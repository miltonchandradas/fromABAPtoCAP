using {com.sap as my} from '../db/schema';

@path: '/service/fromABAPtoCAPSvcs'
service SalesService {
    @readonly
    entity MappingCustomers as projection on my.MappingCustomers;
}

annotate SalesService with @requires: ['authenticated-user'];
