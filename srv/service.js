const cds = require("@sap/cds");
const LOG = cds.log();

module.exports = async (srv) => {
  const { MappingCustomers, Customers, S4SalesOrders, NorthwindCustomers } =
    srv.entities;

  // connect to S/4HANA
  const S4_Service = await cds.connect.to("SalesOrderA2X");

  // connect to Northwind
  const Northwind_Service = await cds.connect.to("northwind");

  srv.before("*", async (req) => {
    console.log("Logged in user: ", req.user?.id);
  });

  srv.on("READ", Customers, async (req) => {
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
    let customerId = req.params[0]?.customerId;
    let orders;

    if (!customerId) {
      orders = await S4_Service.send({
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
    } else {
      const mapping = await SELECT.one
        .from(MappingCustomers)
        .where({ nwCustomerId: customerId });

      orders = await S4_Service.send({
        query: SELECT.from(S4SalesOrders)
          .columns(
            "salesOrder",
            "customerId",
            "salesOrderDate",
            "totalAmount",
            "status"
          )
          .where({ customerId: mapping.s4CustomerId })
          .limit(10),
        headers: {
          apikey: process.env.apikey,
          Accept: "application/json",
        },
      });
    }

    orders.$count = orders.length;
    return orders;
  });

  srv.after("READ", S4SalesOrders, (data) => {
    const orders = Array.isArray(data) ? data : [data];

    orders.forEach((order) => {
      if (order.status === "C") {
        order.status = "Completed";
        order.criticality = 3;
      } else {
        order.status = "Over Due";
        order.criticality = 1;
      }
    });
  });

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
  });
};
