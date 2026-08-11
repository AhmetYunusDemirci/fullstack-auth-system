const express = require("express");
const router = express.Router();
const { createTicket } = require("../controllers/contactController");

// Kullanıcı veya Misafir herkes ticket açabilir (O yüzden protect koymadık)
router.post("/", createTicket);

module.exports = router;