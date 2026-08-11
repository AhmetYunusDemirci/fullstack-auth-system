const ContactMessage = require("../models/ContactMessage");

// YENİ TICKET (DESTEK TALEBİ) OLUŞTUR
const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newTicket = new ContactMessage({
      name,
      email,
      subject,
      message,
      status: "Open", // Varsayılan olarak Açık gelir
    });

    await newTicket.save();

    res.status(201).json({ 
      message: "Ticket created successfully.", 
      ticket: newTicket 
    });

  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createTicket,
};