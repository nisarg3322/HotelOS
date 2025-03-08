const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const hotelChainRoutes = require("./routes/hotelChainRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const managerRoutes = require("./routes/managerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const loginRoutes = require("./routes/loginRoutes");
const ollamaRoutes = require("./routes/ollamaRoutes");

app.use(cors());
app.use(express.json());

app.use("/hotelchains", hotelChainRoutes);
app.use("/hotels", hotelRoutes);
app.use("/rooms", roomRoutes);
app.use("/customers", customerRoutes);
app.use("/employees", employeeRoutes);
app.use("/managers", managerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ollama", ollamaRoutes);
app.use("/login", loginRoutes);
app.use("/", (req, res) => {
  res.status(200).send("Welcome to the Hotel Management System API");
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
