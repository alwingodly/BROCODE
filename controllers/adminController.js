const email = "admin@gmail.com";
const password = "123";

var err_msg
exports.admin = (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin/admin-panel");
    } 
    else {
      res.render("admin/admin-login", { err_msg});
      err_msg = null
    }
  }

  exports.postAdminSubmit =  async (req, res) => {
    if (req.body.email === email && req.body.password === password) {
      req.session.admin = email;
      console.log(req.session.admin);
      res.cookie("admin", "true", { maxAge: 3600000 });
      res.redirect("/admin/admin-panel");
    } else {
      err_msg = "Invalid email or password.";
      res.redirect('/admin')
    }
  }

  exports.adminLogout = (req, res) => {
    req.session.admin = false
    res.clearCookie("admin");
    res.redirect("/admin");
  }
