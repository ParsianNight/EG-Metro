
const db = require('../../connectors/db');



module.exports = function(app) {
  //Register HTTP endpoint to render /index page
  app.get('/', function(req, res) {
    return res.render('index');
  });
// example of passing variables with a page
  app.post('/register', async function(req, res) {
    const stations = await db.select('*').from('se_project.stations');
    return res.render('register', { stations });
  });

  app.get('/prices', async function(req, res) {

    return res.render('prices');
  });
};
