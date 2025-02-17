const pool = require("../config/db");

// 🔹 Get All Bookings
const getAllBookings = async () => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.full_name AS customer_name, r.room_id, e.full_name AS employee_name
       FROM Booking b
       JOIN Customer c ON b.customer_id = c.customer_id
       JOIN Room r ON b.room_id = r.room_id
       LEFT JOIN Employee e ON b.employee_id = e.employee_id`
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Get Booking by ID
const getBookingById = async (bookingId) => {
  try {
    const result = await pool.query(
      `SELECT 
          b.*, 
          c.full_name AS customer_name, 
          r.room_id, 
          h.name AS hotel_name, 
          a.street_address, 
          a.city, 
          a.state, 
          a.postal_code,
          e.full_name AS employee_name
       FROM Booking b
       JOIN Customer c ON b.customer_id = c.customer_id
       JOIN Room r ON b.room_id = r.room_id
       JOIN Hotel h ON r.hotel_id = h.hotel_id
       JOIN Address a ON h.address_id = a.address_id
       LEFT JOIN Employee e ON b.employee_id = e.employee_id
       WHERE b.booking_id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      booking_id: row.booking_id,
      is_archived: row.is_archived,
      check_in_date: row.check_in_date,
      check_out_date: row.check_out_date,
      booking_date: row.booking_date,
      is_checkout: row.is_checkout,
      room_id: row.room_id,
      customer: {
        customer_id: row.customer_id,
        full_name: row.customer_name,
      },
      total_cost: row.total_cost,
      is_paid: row.is_paid,
      is_renting: row.is_renting,
      employee: row.employee_name ? { full_name: row.employee_name } : null,
      hotel: {
        name: row.hotel_name,
        street_address: row.street_address,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
      },
    };
  } catch (err) {
    console.error(err.message);
  }
};
// 🔹 Create a New Booking
const createOnlineBooking = async (
  checkInDate,
  checkOutDate,
  roomId,
  customerId,
  totalCost
) => {
  try {
    const result = await pool.query(
      `INSERT INTO Booking (check_in_date, check_out_date, room_id, customer_id, total_cost) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [checkInDate, checkOutDate, roomId, customerId, totalCost]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const createInPersonBooking = async (
  checkInDate,
  checkOutDate,
  roomId,
  customerId,
  totalCost,
  employeeId
) => {
  try {
    const result = await pool.query(
      `INSERT INTO Booking (check_in_date, check_out_date, room_id, customer_id, total_cost, employee_id, is_renting = true) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [checkInDate, checkOutDate, roomId, customerId, totalCost, employeeId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const rentBooking = async (bookingId, employee_id) => {
  try {
    const result = await pool.query(
      `UPDATE Booking 
       SET is_renting = true , employee_id = $2
       WHERE booking_id = $1 RETURNING *`,
      [bookingId, employee_id]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const payBooking = async (bookingId) => {
  try {
    const result = await pool.query(
      `UPDATE Booking 
         SET is_paid = true
         WHERE booking_id = $1 RETURNING *`,
      [bookingId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const checkoutBooking = async (bookingId) => {
  try {
    const result = await pool.query(
      `UPDATE Booking 
       SET is_checkout = true, is_renting = false
       WHERE booking_id = $1 RETURNING *`,
      [bookingId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Delete a Booking
const deleteBooking = async (bookingId) => {
  try {
    await pool.query(
      `UPDATE Booking 
       SET is_archived = true
       WHERE booking_id = $1 RETURNING *`,
      [bookingId]
    );
    return { message: `Booking with ID ${bookingId} deleted successfully.` };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createOnlineBooking,
  createInPersonBooking,
  rentBooking,
  payBooking,
  checkoutBooking,
  deleteBooking,
};
