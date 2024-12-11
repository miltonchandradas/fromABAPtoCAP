const myService = require("../srv/service");
const cds = require("@sap/cds");

describe("CAP Tests - Group 1", () => {
  const { GET } = cds.test(
    "serve",
    __dirname + "/../srv"
  );

  it("test 1", () => {
    const { name } = { name: "Milton" };
    expect(name).toBe("Milton");
  });

  it("test 2", async () => {
    const {status, data} = await GET("/service/fromABAPtoCAPSvcs/Customers")
    expect(status).toBe(200)
    expect(data.value[0].customerId).toBe('ALFKI')
  });
});
