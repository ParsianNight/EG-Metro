const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session');
const auth = require("../../middleware/auth");
const session = require("../../utils/session");
const getUser = async function (req) {
const sessionToken = getSessionToken(req);

  const user = await db
    .select("*")
    .from("se_project.sessions")
    .where("token", sessionToken)
    .innerJoin(
      "se_project.users",
      "se_project.sessions.userid",
      "se_project.users.id"
    )
    .innerJoin(
      "se_project.roles",
      "se_project.users.roleid",
      "se_project.roles.id"
    )
    .first();

  console.log("user =>", user);
  user.isNormal = user.roleId === roles.user;
  user.isAdmin = user.roleId === roles.admin;
  user.isSenior = user.roleId === roles.senior;
  return user;
};

module.exports = function (app) {
  // example
app.get("/users", auth , async function (req, res) {
    try {
      const user = await getUser(req);
      const users = await db.select('*').from("se_project.users")
        
      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }
  });
  
 async function countStations(Start, End,visited_stations) {
  console.log("start id:",Start,"end id:",End)
  if (Start ===End ){
    visited_stations.push(Start)
   return visited_stations.length;
  }
  visited_stations.push(Start)
  let originposition = await db.select("stationposition").from("se_project.stations").where("id",Start)
  console.log("originposition: ",originposition)
  if (originposition=="middle"){
     console.log("inM")
  //      // 
  //   let curr_SR=[]
  //   let Rend=[]
  //   curr_SR=getstationroutes(Start)
  //   for (let i = 0; i < curr_SR.length; i++) {
  //      Rend.push(await db
  //     .select("toStationid")
  //     .from("se_project.routes")
  //     .where("id", curr_SR[i])
  //     .where("fromStationid",Start))
  //     .whereNotIn("toStationid",visited_stations)
  //     console.log("REEEEEND",Rend[i])
      
  //     countStations(Rend[i],End,visited_stations)
  //  }
  }
   else {
     
    console.log("notM")

     //curr_SR=[]
  let curr_SR = await getstationroutes(Start);

  console.log(curr_SR)
  console.log(curr_SR.length)
  for (let i = 0; i < curr_SR.length; i++) {
    console.log("i",i)
    let Rend=await db
    .select("tostationid")
    .from("se_project.routes")
    .where("id", curr_SR[i])
    .where("fromstationid",Start)
    .then((rows) => rows.map((row) => row.tostationid));
    console.log("REnd",Rend)
    Start=Rend[i];
      if (Start ===End ){    
        visited_stations.push(Start)
        console.log("visited_stations.length",visited_stations.length)
       return visited_stations.length;
      }
   // countStations(Start,End,visited_stations)
  
  }
}}
  const getstationroutes = async function (StationID) {
    let curr_stationroutes=[];
    curr_stationroutes = await db
  .select("routeid")
  .from("se_project.stationroutes")
  .where("stationid", StationID)
  .then((rows) => rows.map((row) => row.routeid));

  
    return curr_stationroutes;
  
  }

  app.post("/api/v1/payment/ticket", auth , async function (req, res) {
    try {
     

      
    } catch (e) {
      console.log(e.message);

      
    }


  });  

  app.post("/api/v1/tickets/price/:originId:destinationId",async function (req, res)  { 
   // const user = await getUser(req)
   const origin =parseInt(req.params.originId);
   console.log(origin,typeof origin)
   const destination =parseInt(req.params.destinationId);
   console.log(destination)

       let visited_stations=[]
    try{
      // const user = await db
      // .select("*")
      // .from("se_project.subsription")
      // .where("userid", session)
      // if (user==null){

      //   const user = await db
      //   .select("*")
      //   .from("se_project.tickets")
      //   .where("userid",session[0])
      // }

      console.log("el return",countStations(origin,destination,visited_stations))
      console.log("ezaaay")
    
      //get the route from database ,then iterate on the stations till it reachs the destination 
      //while cheaking that all station is not transefer station 
      //if it is transfer station put it in array x till it reaches destenation 
      //the stop condition will be reaching end or start station
      //if i reach destination merge 2 array  
      // get length of array which equal to number of stations
      
    
 } catch(e){
   console.log(e.message);
   return res.status(400).send("Could not get price");
}
  });
  

};
