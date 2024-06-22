const cds = require("@sap/cds");

module.exports = async (srv) => {
    const { MappingCustomers, Customers, S4SalesOrders, NorthwindCustomers } = srv.entities;

    // connect to S/4HANA
    const S4_Service = await cds.connect.to("SalesOrderA2X");

    // connect to Northwind
    const Northwind_Service = await cds.connect.to("northwind");

    srv.on("READ", Customers, async (req) => {
        const customers = await Northwind_Service.send({
            query: SELECT.from(NorthwindCustomers)
        });


        customers.forEach(async (customer) => {
            let mapping = await SELECT.one.from(MappingCustomers).where({
                nwCustomerId: customer.customerId
            })

            customer.s4CustomerId = mapping.s4CustomerId;
        })
        
        customers.$count = customers.length
        return customers
    })

    srv.on("READ", S4SalesOrders, async (req) => {
        let orders = await S4_Service.send({
            query: SELECT.from(S4SalesOrders)
                .columns("salesOrder", "customerId", "salesOrderDate", "totalAmount", "status")
                .limit(10),
            headers: {
                apikey: process.env.apikey,
                Accept: "application/json"
            },
        });

        orders.$count = orders.length
        return orders
    })

}