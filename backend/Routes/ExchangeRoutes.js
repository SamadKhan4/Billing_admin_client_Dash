const express = require("express");
const router = express.Router();
const { handleExchangeRequest } = require("../Controllers/ExchangeController");
const { isLoggedIn } = require("../Middlewares/AuthMiddleware");

router.post("/exchange-request", isLoggedIn, handleExchangeRequest);

module.exports = router;
