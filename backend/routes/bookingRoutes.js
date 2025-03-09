const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createOnlineBooking,
  createInPersonBooking,
  rentBooking,
  payBooking,
  checkoutBooking,
  deleteBooking,
  getHotelBookings,
} = require("../queries/bookingQueries");
const { bookingSchema, inPersonBookingSchema } = require("../schemas");
const { route } = require("./managerRoutes");

// 🔹 Get All Bookings
router.get("/", async (req, res) => {
  const bookings = await getAllBookings();
  res.json(bookings);
});

// 🔹 Get Booking by ID
router.get("/:booking_id", async (req, res) => {
  const booking = await getBookingById(req.params.booking_id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

// 🔹 Create a New Booking
router.post("/", async (req, res) => {
  const { error } = bookingSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { check_in_date, check_out_date, room_id, customer_id, total_cost } =
    req.body;
  const newBooking = await createOnlineBooking(
    check_in_date,
    check_out_date,
    room_id,
    customer_id,
    total_cost
  );
  res.status(201).json(newBooking);
});

router.post("/in-person", async (req, res) => {
  const { error } = inPersonBookingSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    check_in_date,
    check_out_date,
    room_id,
    customer_id,
    total_cost,
    employee_id,
  } = req.body;
  const newBooking = await createInPersonBooking(
    check_in_date,
    check_out_date,
    room_id,
    customer_id,
    total_cost,
    employee_id
  );
  res.status(201).json(newBooking);
});

router.get("/hotel/:hotel_id", async (req, res) => {
  const bookings = await getHotelBookings(req.params.hotel_id);
  res.json(bookings);
});

// 🔹 Rent a Booking
router.put("/:booking_id/rent", async (req, res) => {
  const { employee_id } = req.body;
  const rentedBooking = await rentBooking(req.params.booking_id, employee_id);
  if (!rentedBooking)
    return res.status(404).json({ message: "Booking not found" });
  res.json(rentedBooking);
});

// 🔹 Pay a Booking
router.put("/:booking_id/pay", async (req, res) => {
  const paidBooking = await payBooking(req.params.booking_id);
  if (!paidBooking)
    return res.status(404).json({ message: "Booking not found" });
  res.json(paidBooking);
});

// 🔹 Checkout a Booking
router.put("/:booking_id/checkout", async (req, res) => {
  const checkedOutBooking = await checkoutBooking(req.params.booking_id);
  if (!checkedOutBooking)
    return res.status(404).json({ message: "Booking not found" });
  res.json(checkedOutBooking);
});

// 🔹 Delete a Booking
router.delete("/:booking_id", async (req, res) => {
  const result = await deleteBooking(req.params.booking_id);
  res.json(result);
});

module.exports = router;
