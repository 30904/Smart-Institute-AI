const express = require("express");

const { getContext } = require("../controllers/institutionController");

const router = express.Router();

router.get("/context", getContext);

module.exports = router;
