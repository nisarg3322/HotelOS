const express = require("express");
const router = express.Router();
const { createUser } = require("../queries/userQueries");
const {
  createCustomer,
  getCustomerByUserId,
} = require("../queries/customerQueries");
const {
  createEmployee,
  getEmployeeByUserId,
} = require("../queries/employeeQueries");
const { searchUserByEmail } = require("../queries/userQueries");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/customer", async (req, res) => {
  const { email, password, full_name, address, ssn } = req.body;
  if (!email || !password || !full_name || !address || !ssn) {
    return res.status(400).json({ message: "bad request" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await createUser(email, hashedPassword, true);
    const customer = await createCustomer(
      full_name,
      address,
      ssn,
      user.user_id
    );
    // Generate JWT token
    const token = jwt.sign({ _id: user.user_id, role: "customer" }, "secret", {
      expiresIn: "1h",
    });
    res.status(201).json({ token, user: { ...user, ...customer } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/employee", async (req, res) => {
  const { email, password, full_name, address, ssn, hotel_id, role } = req.body;
  if (
    !email ||
    !password ||
    !full_name ||
    !address ||
    !ssn ||
    !hotel_id ||
    !role
  ) {
    return res.status(400).json({ message: "bad request" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await createUser(email, hashedPassword, false);
    const employee = await createEmployee(
      user.user_id,
      full_name,
      address,
      ssn,
      hotel_id,
      role
    );
    // Generate JWT token
    const token = jwt.sign({ _id: user.user_id, role: "employee" }, "secret", {
      expiresIn: "1h",
    });
    res.status(201).json({ token, user: { ...user, ...employee } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login route for both customers and employees
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await searchUserByEmail(email);

    if (!user) return res.status(400).send("Username or password is wrong");

    let resultUser;
    if (user.is_customer) {
      resultUser = await getCustomerByUserId(user.user_id);
    } else if (user.is_customer === false) {
      resultUser = await getEmployeeByUserId(user.user_id);
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send("Invalid password");

    const token = jwt.sign(
      { _id: user.user_id, role: user.is_customer ? "customer" : "employee" },
      "secret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, user: { ...user, ...resultUser } });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
