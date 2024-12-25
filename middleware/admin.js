const admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .send(
        "Access denied. You do not have permission to perform this action."
      );
  }
  next();
};

module.exports = admin;
