const cds = require("@sap/cds");

module.exports = async (srv) => {
    const { MappingCustomers, Customers, S4SalesOrders, NorthwindCustomers } = srv.entities;

    // connect to S/4HANA
    const S4_Service = await cds.connect.to("SalesOrderA2X");

    // connect to Northwind
    const Northwind_Service = await cds.connect.to("northwind");

    srv.on("READ", Customers, async (req) => {

        const getCustomers = async () => {

            if (req.data?.customerId) {
                let customer = await Northwind_Service.send({
                    query: SELECT.one.from(NorthwindCustomers).where({ customerId: req.data?.customerId }),
                });

                customer = await getS4CustomerId(customer)
                customer = await getS4Orders(customer)
                return customer
            }
            let customers = await Northwind_Service.send({
                query: SELECT.from(NorthwindCustomers),
            });

            customers.$count = customers.length;
            return customers;
        }

        const getS4CustomerId = async (customer) => {
            let mapping = await SELECT.one.from(MappingCustomers).where({
                nwCustomerId: customer.customerId
            })

            customer.s4CustomerId = mapping.s4CustomerId;
            return customer;
        }

        const getS4Orders = async (customer) => {
            const orders = await S4_Service.send({
                query: SELECT.from(S4SalesOrders)
                    .where({ customerId: customer.s4CustomerId })
                    .columns("salesOrder", "customerId", "salesOrderDate", "totalAmount", "status")
                    .limit(10),
                headers: {
                    apikey: process.env.apikey,
                },
            });
            customer.orders = orders;
            customer.orders.$count = orders.length
            return customer
        }

        if (!req.query.SELECT.columns) return getCustomers();

        const expandIndex = req.query.SELECT.columns.findIndex(
            ({ expand, ref }) => expand && ref[0] === "orders"
        );
        console.log(req.query.SELECT.columns);
        if (expandIndex < 0) return getCustomers();

        let customers = await Northwind_Service.send({
            query: SELECT.from(NorthwindCustomers).limit(5)
        })

        await Promise.all(
            customers.map(async (customer) => {
                await getS4CustomerId(customer)
            })
        )

        try {
            customers = Array.isArray(customers) ? customers : [customers];

            return await Promise.all(
                customers.map(async (customer) => {
                    customer = await getS4Orders(customer)
                    return customer
                })
            );
        } catch (error) {
            console.log("Error: ", error)
        }
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