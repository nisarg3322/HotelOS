const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const { prompt } = req.body;

  const response = await axios.post(
    "http://host.docker.internal:11434/api/generate",
    {
      model: "llama3.2",
      prompt,
      stream: false,
    }
  );
  res.json(response.data.response);
});

module.exports = router;
