const db = require('../../connectors/db');
const roles = require('../../constants/roles');
const { getSessionToken } = require('../../utils/session');
// TODO -> create a navbar for admins and one for users
const getUser = async function(req) {
  const sessionToken = getSessionToken(req);

  //console.log(sessionToken)
  const user = await db.select('*')
    .from('se_project.sessions')
    .where('token', sessionToken)
    .innerJoin('se_project.users', 'se_project.sessions.userid', 'se_project.users.id')
    .innerJoin('se_project.roles', 'se_project.users.roleid', 'se_project.roles.id')
    .first();
  
 // console.log('user =>', user)
  user.isStudent = user.roleid === roles.student;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;

  return user;  
}

module.exports = function(app) {
  // Register HTTP endpoint to render /users page
  app.get('/dashboard', async function(req, res) {
    const user = await getUser(req);
    return res.render('dashboard', user);
  });

  // Register HTTP endpoint to render /users page
  app.get('/users', async function(req, res) {
    const users = await db.select('*').from('se_project.users');
    return res.render('users', { users });
  });

  // Register HTTP endpoint to render routesManageing page
  app.get('/manage/stations', async function(req, res) {
    const user = await getUser(req);
    const stations = await db.select('*').from('se_project.stations');
    return res.render('stationsManageing', { ...user, stations });
  });

  app.get('/manage/routes', async function(req, res) {
    const user = await getUser(req);
    const routes = await db.select('*').from('se_project.routes');
    return res.render('routesManageing', { ...user, routes });
  });
  app.get('/tickets', async function(req, res) {
    const user = await getUser(req);
    return res.render('tickets', { ...user });
  });
  app.get('/pay_online', async function(req, res) {
    const user = await getUser(req);
    return res.render('pay_online', { ...user });
  });
  app.get('/pay_online', async function(req, res) {
    const user = await getUser(req);
    return res.render('pay_online', { ...user });
  });
  app.get('/pay_by_subscription', async function(req, res) {
    const user = await getUser(req);
    return res.render('pay_by_subscription', { ...user });
  });
  //------------------------------------------------------------------------------------------------------------
  // 1st 3ars
  app.get("/requests/refund" , async (req,res) =>{
    const user = await getUser(req);
    const tickets = await db.select('*').from('se_project.tickets').where("userid", user.userid);
    //console.log("ticket",tickets);
    return res.render('refund_requests' ,  { ...user, tickets });
  });

  app.get("/requests/senior", async (req, res) => {
    res.render("Senior_Request");
  });

  app.get("/rises/simulate" ,async(req,res)=>{
    res.render("simulate_ride")
  });
};  