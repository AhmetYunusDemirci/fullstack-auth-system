const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      message: `Welcome ${user.name} ${user.surname}`,
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboard,
};