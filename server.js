const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const hotelChainRoutes = require("./routes/hotelChainRoutes");
const hotelRoutes = require("./routes/hotelRoutes");

app.use(express.json());
app.use("/hotelchains", hotelChainRoutes);
app.use("/hotels", hotelRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
