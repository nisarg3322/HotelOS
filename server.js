const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const hotelChainRoutes = require("./routes/hotelChainRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const managerRoutes = require("./routes/managerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use(express.json());
app.use("/hotelchains", hotelChainRoutes);
app.use("/hotels", hotelRoutes);
app.use("/rooms", roomRoutes);
app.use("/customers", customerRoutes);
app.use("/employees", employeeRoutes);
app.use("/managers", managerRoutes);
app.use("/bookings", bookingRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
