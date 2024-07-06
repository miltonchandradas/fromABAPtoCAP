const cds = require("@sap/cds");

module.exports = async (srv) => {
  const { MappingCustomers, Customers, S4SalesOrders, NorthwindCustomers } =
    srv.entities;

  // connect to S/4HANA
  const S4_Service = await cds.connect.to("SalesOrderA2X");

  // connect to Northwind
  const Northwind_Service = await cds.connect.to("northwind");

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  srv.on("READ", Customers, async (req) => {

    // Sequential...
    // await delay(10000)
    // await delay(10000)
    // return [];

    // Parallel...
    // await Promise.all([delay(10000), delay(10000)])
    // return [];

    const mappings = await SELECT.from(MappingCustomers);

    const getCustomers = async () => {
      let customers = await Northwind_Service.send({
        query: SELECT.from(NorthwindCustomers),
      });

      customers.$count = customers.length;
      return customers;
    };

    const getCustomer = async () => {
      let customer = await Northwind_Service.send({
        query: SELECT.one
          .from(NorthwindCustomers)
          .where({ customerId: req.data?.customerId }),
      });

      customer = await getS4CustomerId(customer);
      customer = await getS4Orders(customer);
      return customer;
    };

    const getS4CustomerId = async (customer) => {
      const mapping = mappings.find(
        (mapping) => mapping.nwCustomerId === customer.customerId
      );
      customer.s4CustomerId = mapping?.s4CustomerId;
      return customer;
    };

    const getS4Orders = async (customer) => {
      const orders = await S4_Service.send({
        query: SELECT.from(S4SalesOrders)
          .where({ customerId: customer.s4CustomerId })
          .columns(
            "salesOrder",
            "customerId",
            "salesOrderDate",
            "totalAmount",
            "status"
          )
          .limit(10),
        headers: {
          apikey: process.env.apikey,
        },
      });
      customer.orders = orders;
      customer.orders.$count = orders.length;
      return customer;
    };

    if (!req.data?.customerId) return getCustomers();

    let customer = await getCustomer();
    customer = await getS4Orders(customer);

    return customer;
  });

  srv.on("READ", S4SalesOrders, async (req) => {
    let orders = await S4_Service.send({
      query: SELECT.from(S4SalesOrders)
        .columns(
          "salesOrder",
          "customerId",
          "salesOrderDate",
          "totalAmount",
          "status"
        )
        .limit(10),
      headers: {
        apikey: process.env.apikey,
        Accept: "application/json",
      },
    });

    orders.$count = orders.length;
    return orders;
  });
};
