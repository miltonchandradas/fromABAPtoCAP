const cds = require("@sap/cds");
const LOG = cds.log();

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

        req.query.SELECT.columns.splice(expandIndex, 1);
        if (
            !req.query.SELECT.columns.find((column) =>
                column.ref.find((ref) => ref == "orders")
            )
        ) {
            req.query.SELECT.columns.push({ ref: ["orders_salesOrder"] });
        }


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

    srv.after("READ", S4SalesOrders, (data) => {
        const orders = Array.isArray(data) ? data : [data];

        orders.forEach(order => {
            if (order.status === 'C') {
                order.status = "Completed"
                order.criticality = 3
            } else {
                order.status = "Over Due"
                order.criticality = 1
            }
        })
    })


    srv.on("error", (err, req) => {
        console.log("Logged in user: ", req.user?.id);
        
        switch (err.message) {
            case "UNIQUE_CONSTRAINT_VIOLATION":
            case "ENTITY_ALREADY_EXISTS":
                err.message = "The entry already exists.";
                break;

            case "Unauthorized":
            case "forbidden":
                err.message = "Unauthorized - Please login with a valid user.";
                break;

            case "Precondition Failed":
                err.message =
                    "There is a more recent version of the JobAction available.  Please refresh the browser and try again.";
                break;

            case "404":
                err.message =
                    "The requested resource was not found.  Please refresh the browser and try again.";
                break;

            default:
                LOG._info && LOG.info("Some middleware error...");
                LOG._info && LOG.info("ERROR MESSAGE: ", err.message);
                break;
        }
    })

}