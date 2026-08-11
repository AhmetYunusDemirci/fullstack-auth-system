const ContactMessage = require("../models/ContactMessage");

// YENİ TICKET (DESTEK TALEBİ) OLUŞTUR
const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // --- BACKEND GÜVENLİK KONTROLÜ ---
    if (name.length > 50) return res.status(400).json({ message: "Name is too long (Max 50)" });
    if (subject.length > 100) return res.status(400).json({ message: "Subject is too long (Max 100)" });
    if (message.length > 3000) return res.status(400).json({ message: "Message is too long (Max 3000)" });
    
    // Basit bir Email Regex Kontrolü (Sadece düzgün formatlı mailleri kabul et)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    // ---------------------------------

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