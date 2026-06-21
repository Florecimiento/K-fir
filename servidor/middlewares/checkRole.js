function checkRole(roleRequired) {
  return (req, res, next) => {
    const userRole = req.headers["user-role"];
    if (userRole !== roleRequired) {
      return res.status(403).json({ msg: "Permiso denegado" });
    }
    next();
  };
}

module.exports = checkRole;
const checkRole = require("./middlewares/checkRole");
app.get("/api/superadmin/data", checkRole("superadmin"), (req, res) => {
  res.json({ msg: "Solo el superadmin puede ver esto." });
});

