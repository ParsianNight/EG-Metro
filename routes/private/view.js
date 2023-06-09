const db = require('../../connectors/db');
const roles = require('../../constants/roles');
const authorization = require('../../middleware/authorization');
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
    console.log(user)
    return res.render('dashboard', {...user});
  });
 

  // Register HTTP endpoint to render /users page
  app.get('/users', async function(req, res) {
    const users = await db.select('*').from('se_project.users')
    return res.render('users', { users });
  });

  // Register HTTP endpoint to render routesManageing page
  app.get('/manage/stations',authorization, async function(req, res) {
    const user = await getUser(req);
    const stations = await db.select('*').from('se_project.stations');
    return res.render('stationsManageing', { ...user, stations });
  });

  app.get('/manage/routes',authorization, async function(req, res) {
    const user = await getUser(req);
    const routes = await db.select('*').from('se_project.routes');
    return res.render('routesManageing', { ...user, routes });
  });
  app.get("/manage/stations/create" ,authorization, async(req,res)=>{
  const user = await getUser(req);

  res.render("createStation",{...user})
});

app.get("/manage/routes/create" ,authorization, async(req,res)=>{
  const user = await getUser(req);

  res.render("createRoute",{...user})
});
  app.get('/tickets', async function(req, res) {
    const user = await getUser(req);
    return res.render('tickets', { ...user });
  });
  app.get('/prices', async function(req, res) {
    const user = await getUser(req);
    const tickets = await db.select('*').from('se_project.tickets').where("userid", user.userid);
    const stations = await db.select('*').from('se_project.stations')

        return res.render('prices',  { ...user, tickets,stations });
  });
  app.get('/pay_online', async function(req, res) {
    const user = await getUser(req);
    const stations = await db.select('*').from('se_project.stations')
    return res.render('pay_online', { ...user ,stations});
  });

  app.get('/pay_by_subscription', async function(req, res) {
    const user = await getUser(req);
    const stations = await db.select('*').from('se_project.stations')
    return res.render('pay_by_subscription', { ...user,stations });
  });

  app.get('/subscriptions', async function(req, res) {
    const user = await getUser(req);
   // const zones=await db.select("*").from("se_project.zones") 
    return res.render('subscription', { ...user });
  });

  app.get('/subscriptions/show', async function(req, res) {
    const user = await getUser(req);
    const subscriptions =await db.select("*").from("se_project.subsription").where("userid", user.userid);
    return res.render('showsubs', { ...user , subscriptions });
  });




  //------------------------------------------------------------------------------------------------------------
  
  app.get("/requests/refund" , async (req,res) =>{
    const user = await getUser(req);
    const tickets = await db.select('*').from('se_project.tickets').where("userid", user.userid);
    return res.render('refund_requests' ,  { ...user, tickets });
  });

  app.get("/myrequsets",async(req,res)=>{
    const user = await getUser(req);
    const requests = await db.select('*').from('se_project.refund_requests').where("userid", user.userid);
    console.log(requests)
    return res.render('myrequsets' ,  { ...user, requests });
});

  app.get("/requests/senior", async (req, res) => {
    const user = await getUser(req);
    res.render("Senior_Request");
  });

  app.get("/rides/simulate" ,async(req,res)=>{
    const stations = await db.select('stationname').from('se_project.stations').then((rows) => rows.map((row) => row.stationname));
    console.log(stations)
    res.render("simulate_ride",{stations})
});


app.get("/resetPassword", async function (req, res) {
  return res.render("resetPassword");
});



//-----------------------------------------loffy----------------------------------
app.get('/requestedrefunds', async function(req, res) {
  const user = await getUser(req);
  const stations = await db.select('*').from('se_project.stations');
  return res.render('requests_refunds');
});
app.get('/updatezones',authorization, async function(req, res) {
  const user = await getUser(req);
  const stations = await db.select('*').from('se_project.stations');
  return res.render('updatezones');
});
app.get('/senior_req',authorization, async function(req, res) {
  return res.render('S_req');
});

app.get('/logout', async function(req,res) {
  req.logout();

  // destroy session data
  req.session = null;

  // redirect to homepage
  res.redirect('/');
})
  

};  
