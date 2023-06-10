
const db = require('../../connectors/db');



module.exports = function(app) {
  //Register HTTP endpoint to render /index page


// example of passing variables with a page
  app.get('/register', async function(req, res) {
    const stations = await db.select('*').from('se_project.stations');
    return res.render('register', { stations });
  });
  // app.get("/", async function (req, res) {
  //   return res.render("landingpage");
  // });
 
  app.get("/login", async function (req, res) {
    return res.render("LoginPage");
  });

  app.get("/AboutUs", async function (req, res) {
    return res.render("AboutUs");
  });
 app.get('/unauthorized', async function(req, res) {
    return res.render('401');
  });

  app.get("/AboutUs", async function (req, res) {
    return res.render("AboutUs");
  });

  app.get("/", async function (req, res) {
    return res.render("landingpage");
  });

  app.get('/forgetpassword', function(req,res) {
    return res.render('forget1')
  })

  app.get('/forgetpassword/:token', function(req, res) {
    const token = req.params.token;
    return res.render('forget2', { token });
  });


};