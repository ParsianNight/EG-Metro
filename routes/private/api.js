const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const { getSessionToken } = require('../../utils/session');
const auth = require("../../middleware/auth");
const session = require("../../utils/session");
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  // toDo
  // Add Authorization
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

<<<<<<< HEAD
 // console.log("user =>", user);
=======
>>>>>>> d3ee21817ad9d01556fd5e2e03f699eb46200719
  user.isNormal = user.roleId === roles.user;
  user.isAdmin = user.roleId === roles.admin;
  user.isSenior = user.roleId === roles.senior;
  return user;
};

module.exports = function (app) {
  // example
  app.get("/users", auth, async function (req, res) {
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

<<<<<<< HEAD
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



  app.post("/api/v1/payment/subscription", auth , async function (req, res) {
    const {purchasedId,creditCardNumber,holderName,payedAmount,subType,zoneId }= req.body;
    console.log(purchasedId,creditCardNumber,holderName,payedAmount,subType,zoneId );

    try {

      const user = await getUser(req);
      const user_id=user.userid;
      const sub = await db.select("*").from("se_project.subsription").where("userid",user_id)
      if(sub.length!=0){
       
 
   
 
 
      const tran={
       amount:payedAmount ,
       userid:user_id ,
       purchasediid:purchasedId
     };
     console.log("tran",tran)
      await db("se_project.transactions").insert(tran);
 
      const tic = {
       origin:origin,
       destination:destination,
       userid:user_id,
       tripdate:tripDate,
       //subiD:null
      };
      console.log("tic",tic)
 
      await db("se_project.tickets").insert(tic);
    
 
      const t_id = await db.select("id").from("se_project.tickets").where("origin",origin).andWhere("destination", destination)
      .andWhere("userid",user_id).andWhere("tripdate",tripDate).then((rows) => rows.map((row) => row.id));
 
       console.log(t_id);
      
 
      const r ={
       status:"upcoming",
       origin:origin,
       destination:destination,
       userid:user_id,
       tripdate:tripDate,
       ticketid:t_id[0]
     };
     console.log("r",r); 
     await db("se_project.rides").insert(r);
     return res.status(200).json({message: "ride added"}) ;     
 
   }
   else
     return res.status(400).json({error: "you Donot have a subsription "}) ;     
     } catch (e) {
       console.log(e.message);
 
       
     }
 


});


  app.post("/api/v1/payment/ticket", auth , async function (req, res) {
    const {purchasedId,creditCardNumber,holderName,payedAmount,origin,destination,tripDate }= req.body;
    console.log(purchasedId,creditCardNumber,holderName,payedAmount,origin,destination,tripDate )
    try {

     const user = await getUser(req);
     const user_id=user.userid;
     const sub = await db.select("*").from("se_project.subsription").where("userid",user_id)
     if(sub.length==0){
      

  


     const tran={
      amount:payedAmount ,
      userid:user_id ,
      purchasediid:purchasedId
    };
    console.log("tran",tran)
     await db("se_project.transactions").insert(tran);

     const tic = {
      origin:origin,
      destination:destination,
      userid:user_id,
      tripdate:tripDate,
      //subiD:null
     };
     console.log("tic",tic)

     await db("se_project.tickets").insert(tic);
   

     const t_id = await db.select("id").from("se_project.tickets").where("origin",origin).andWhere("destination", destination)
     .andWhere("userid",user_id).andWhere("tripdate",tripDate).then((rows) => rows.map((row) => row.id));

      console.log(t_id);
     

     const r ={
      status:"upcoming",
      origin:origin,
      destination:destination,
      userid:user_id,
      tripdate:tripDate,
      ticketid:t_id[0]
    };
    console.log("r",r); 
    await db("se_project.rides").insert(r);
    return res.status(200).json({message: "ride added"}) ;     

  }
  else
    return res.status(400).json({error: "you have a subsription so you canot pay online"}) ;     
    } catch (e) {
      console.log(e.message);

      
    }


  });  




  

};
=======
  // create station
  app.post("/api/v1/station", async function (req, res) {
    try {
      const newStation = {
        stationname: req.body.stationName,
        stationtype: req.body.stationType == 0 ? "normal" : "transfer",
        stationposition: null,
        stationstatus: "new"
      };
      const station = await db("se_project.stations").insert(newStation).returning("*");
      res.status(201).json(station);
    } catch (e) {
      console.log(e.message);
      res.status(400).send("Error occurred, please recheck the data you entered!");
    }
  });

  // update station
  app.put("/api/v1/station/:id", async function (req, res) {
    try {
      const updateStation = {};

      if (req.body.stationName) {
        updateStation.stationname = req.body.stationName;
      }

      if (req.body.stationType !== undefined) {
        updateStation.stationtype = req.body.stationType === 0 ? "normal" : "transfer";
      }

      if (req.body.stationStatus) {
        updateStation.stationstatus = req.body.stationStatus;
      }

      if (Object.keys(updateStation).length === 0) {
        throw new Error("No valid data provided for updating a station");
      }




      var station = await db("se_project.stations").where("id", req.params.id).update(updateStation);
      if (station == 0) {
        throw new Error("error while updating a station, please try again later");
      }
      station = await db.select('*').from("se_project.stations").where("id", req.params.id)

      res.status(200).json(station);
    } catch (e) {
      console.log(e.message);
      res.status(400).send("Error occurred, please recheck the data you entered!");
    }
  });

/**
 * Function for checking position of the station
 */
async function alterPosition(affectedStations) {
  for (const id of affectedStations) {
    var startRoute1 = await db.select('*').from("se_project.routes").where("fromstationid", id);
    var endRoute1 = await db.select('*').from("se_project.routes").where("tostationid", id);
    
    if (Object.keys(startRoute1).length !== 0 && Object.keys(endRoute1).length !== 0) {
      await db("se_project.stations").where("id", id).update({ stationposition: 'middle' });
    } else if (Object.keys(startRoute1).length !== 0) {
      await db("se_project.stations").where("id", id).update({ stationposition: 'start' });
    } else if (Object.keys(endRoute1).length !== 0) {
      await db("se_project.stations").where("id", id).update({ stationposition: 'end' });
    } else {
      await db("se_project.stations").where("id", id).update({ stationposition: '' });
    }
  }
}

  // delete a station
  app.delete("/api/v1/station/:id", async function (req, res) {
    var affectedStations = new Set();

    try {

      var startRoute = await db.select('*').from("se_project.routes").where("fromstationid", req.params.id)
      var endRoute = await db.select('*').from("se_project.routes").where("tostationid", req.params.id)
// Adding new routes after we demolish the routes of the deleted station.
      if (Object.keys(startRoute).length === 0 && Object.keys(endRoute).length === 0) {
        deleted = await db("se_project.stations")
          .where("id", req.params.id)
          .del()
      } else {
        if(Object.keys(startRoute).length !== 0){
        for (const Query in startRoute) {
          var fromID;
          var toID;
          // iterate over attributes of object containning routes where tostationid is needed
          for (const r1 in startRoute[Query]) {
            if (r1 == "tostationid") {
              toID = startRoute[Query][r1]
            }
          }
          
          for (const Query2 in endRoute) {
            for (const r2 in endRoute[Query2]) {
              if (r2 == "fromstationid") {
                fromID = endRoute[Query2][r2]
                affectedStations.add(fromID)

              }
            }
            if (toID != null && fromID != null) {
              const newRoute = {
                fromstationid: fromID,
                tostationid: toID,
                routename: "hi" + fromID +"x"+ toID
                
              };
              const route = await db("se_project.routes").insert(newRoute).returning("*");
            }
          }
          affectedStations.add(toID)
        }
      } else {
        for (const Query2 in endRoute) {
          for (const r2 in endRoute[Query2]) {
            if (r2 == "fromstationid") {
              fromID = endRoute[Query2][r2]
              affectedStations.add(fromID)

            }
          }
      }
    }
        // Changing position 

        var route = await db("se_project.routes")
        .where("tostationid", req.params.id)
        .del()
         route = await db("se_project.routes")
        .where("fromstationid", req.params.id)
        .del()



        deleted = await db("se_project.stations")
        .where("id", req.params.id)
        .del()
      }
      await alterPosition(affectedStations)
      res.status(200).send("Station deleted successfully!");
    } catch (e) {
      console.log(e.message)
      res.status(400).send(e.message)
    }

  })

  // create route
  app.post("/api/v1/route", async function (req, res) {
    try {
      const newRoute = {
        fromstationid: req.body.fromStationId,
        tostationid: req.body.toStationId,
        routename: req.body.routeName
      };
      console.log(newRoute)
      const route = await db("se_project.routes").insert(newRoute).returning("*");
      await alterPosition(new Set([req.body.toStationId,req.body.fromStationId]))

      res.status(201).json(route);
    } catch (e) {
      console.log(e.message);
      res.status(400).send("Error occurred, please recheck the data you entered!");
    }
  });

  // update route
  app.put("/api/v1/route/:id", async function (req, res) {
    try {
      const updateRoute = {};

      if (req.body.routeName) {
        updateRoute.routename = req.body.routeName;
      }

      if (Object.keys(updateRoute).length === 0) {
        throw new Error("No valid name provided for updating a route");
      }




      var station = await db("se_project.routes").where("id", req.params.id).update(updateRoute);
      if (station == 0) {
        throw new Error("error while updating a route, please try again later");
      }
      station = await db.select('*').from("se_project.routes").where("id", req.params.id)

      res.status(200).json(station);
    } catch (e) {
      console.log(e.message);
      res.status(400).send("Error occurred, please recheck the data you entered!");
    }
  });
  // delete route
  app.delete("/api/v1/route/:id", async function (req, res) {

    try {

      var route = await db.select('*').from("se_project.routes").where("id", req.params.id)
      if (Object.keys(route).length === 0) {
        throw new Error("route not found!");
      }
      affectedStations = new Set();
      affectedStations.add(route[0]["tostationid"])
      affectedStations.add(route[0]["fromstationid"])
      t = await db("se_project.routes")
        .where("id", req.params.id)
        .del()
        
      await alterPosition(affectedStations)
      res.status(200).send("deleted successfully!");
    } catch (e) {
      console.log(e.message)
      res.status(400).send(e.message)
    }

  })


};
>>>>>>> d3ee21817ad9d01556fd5e2e03f699eb46200719
