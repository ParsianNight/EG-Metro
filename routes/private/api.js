const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const { getSessionToken } = require('../../utils/session');
const auth = require("../../middleware/auth");
const authorization = require("../../middleware/authorization");
function calculateAge(id) {
  console.log(id + "|hoHOOO");
  const year = parseInt(id.substring(1, 3));
  const now = new Date();
  const currentYear = now.getFullYear();
  let age;
  if (id[0] === '2') {
      age = 1900 + year;
  } else {
      age = 2000 + year;
  }
  return currentYear - age;
}
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

  // create station
  app.post("/api/v1/station",authorization, async function (req, res) {
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
  app.put("/api/v1/station/:id",authorization, async function (req, res) {
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
 */async function alterPosition(affectedStations) {
  for (const id of affectedStations) {
    var startRoute1 = await db.select('').from("se_project.routes").where("fromstationid", id);
    var endRoute1 = await db.select('').from("se_project.routes").where("tostationid", id);

    if (Object.keys(startRoute1).length > 1 && Object.keys(endRoute1).length > 1) {
      await db("se_project.stations").where("id", id).update({ stationposition: 'middle' });
    } else if (Object.keys(startRoute1).length !== 0) {
      await db("se_project.stations").where("id", id).update({ stationposition: 'start' });
    } else if (Object.keys(endRoute1).length !== 0) {
      await db("se_project.stations").where("id", id).update({ stationposition: 'end' });
    } else {
      await db("se_project.stations").where("id", id).update({ stationposition: '', stationstatus:'new' });
    }
  }
}
  // delete a station
  app.delete("/api/v1/station/:id", authorization,async function (req, res) {
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
              var routeStation = await db("se_project.stationroutes").insert({stationid: fromID,routeid: route[0].id}).returning("");
              routeStation = await db("se_project.stationroutes").insert({stationid: toID,routeid: route[0].id}).returning("");
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
  app.post("/api/v1/route",authorization, async function (req, res) {
    try {
      var newRoute = {
        fromstationid: req.body.fromStationId,
        tostationid: req.body.toStationId,
        routename: req.body.routeName
      };
      console.log(newRoute)
      var route = await db("se_project.routes").insert(newRoute).returning("*");

       newRoute = {
        fromstationid: req.body.toStationId,
        tostationid: req.body.fromStationId,
        routename: req.body.routeName
      };
       route = await db("se_project.routes").insert(newRoute).returning("*");
      var routeStation = await db("se_project.stationroutes").insert({stationid: req.body.fromStationId,routeid: route[0].id}).returning("");
      routeStation = await db("se_project.stationroutes").insert({stationid: req.body.toStationId,routeid: route[0].id}).returning("");
      var station = await db("se_project.stations").where("id", req.body.fromStationId).update({stationstatus: "old"});
      station = await db("se_project.stations").where("id", req.body.toStationId).update({stationstatus: "old"});
      await alterPosition(new Set([req.body.toStationId,req.body.fromStationId]))

      res.status(201).json(route);
    } catch (e) {
      console.log(e.message);
      res.status(400).send("Error occurred, please recheck the data you entered!");
    }
  });
  // update route
  app.put("/api/v1/route/:id",authorization, async function (req, res) {
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
  app.delete("/api/v1/route/:id",authorization, async function (req, res) {

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

  });

//------------------------------------------------------------------------------------------------------------------

// payment FOR sub

app.post("/api/v1/payment/subscription", auth , async function (req, res) {
  const {purchasedId,creditCardNumber,holderName,payedAmount,subType,zoneId }= req.body;
  console.log(purchasedId,creditCardNumber,holderName,payedAmount,subType,zoneId );

  try {

   // const exists = await db.select("").from().where()

    const user = await getUser(req);
    const user_id=user.userid;
    const sub = await db.select("*").from("se_project.subsription").where("userid",user_id)
    if(sub.length==0){
    
    const tran={
     amount:payedAmount ,
     userid:user_id ,
     purchase_type:"subsription",
     purchasediid:purchasedId
   };
    n =0;
   if(subType=="annual")
      n=100;
      else if(subType=="month")
      n=10;
      else if(subType=="quarterly")
      n=50;


    await db("se_project.transactions").insert(tran);

    const s2 = {
      subtype:subType,
      zoneid:zoneId,
      userid:user_id,
      nooftickets:n
    };

    await db("se_project.subsription").insert(s2);
  

 }
 else
   return res.status(400).json({error: "you  have a subsription "}) ;     
   } catch (e) {
     console.log(e.message);

     
   }



});
// payment for ticket online
  app.post("/api/v1/payment/ticket", auth , async function (req, res) {
    const {creditCardNumber,holderName,payedAmount,origin,destination,tripDate }= req.body;
    console.log(creditCardNumber,holderName,payedAmount,origin,destination,tripDate )
    try {
      
     const user = await getUser(req);
     const user_id=user.userid;
     const sub = await db.select("*").from("se_project.subsription").where("userid",user_id)
     const s = "ticket"
     if(sub.length==0){


      const ticketExists = await db.select("*").from("se_project.tickets")
    .where({
      userid: user_id,
      origin: origin,
      destination: destination,
      tripdate : tripDate
    })
    if(ticketExists!=0){
      return res.status(400).json({error: "ticketExists"}) ;     
    }


     const tic = {
      origin:origin,
      destination:destination,
      userid:user_id,
      tripdate:tripDate
      //subiD:null
     };
    //  console.log("tic",tic)

     await db("se_project.tickets").insert(tic);
   

     const t_id = await db.select("id").from("se_project.tickets").where("origin",origin).andWhere("destination", destination)
     .andWhere("userid",user_id).andWhere("tripdate",tripDate).then((rows) => rows.map((row) => row.id));

      // console.log(t_id);
     

     const r ={
      status:"upcoming",
      origin:origin,
      destination:destination,
      userid:user_id,
      tripdate:tripDate,
      ticketid:t_id[0]
    };
    // console.log("r",r); 
    await db("se_project.rides").insert(r);
    const tran={
      amount:payedAmount ,
      userid:user_id ,
      purchasediid:t_id,
      purchase_type:s,

    };
    // console.log("tran",tran)
     await db("se_project.transactions").insert(tran);

     //---------------------------

     const stations = await db.select("*").from("se_project.stations");
    const routes = await db.select("*").from("se_project.routes");
  
    // console.log(origin,"---",destination)
  const Path = get_path(stations,routes,origin,destination) 
  // console.log(Path)
  let distance = Path.length;
  let price =0;
  if(distance<=9){
      price = await db.select("price").from("se_project.zones").where("zonetype","1").then((rows) => rows.map((row) => row.price));
  }
  else if(distance>9 && distance<=16){
    price = await db.select("price").from("se_project.zones").where("zonetype","2").then((rows) => rows.map((row) => row.price));
}
else if(distance<=9){
  price = await db.select("price").from("se_project.zones").where("zonetype","3").then((rows) => rows.map((row) => row.price));
}
let way=get_way(Path)
// console.log( 'price:',price[0] )  


return res.status(200).json({ message: 'Path: '+way+' price: '+price[0] +"pounds",Number: distance,pp:Path} );

  }
  else
    return res.status(400).json({error: "you have a subsription so you canot pay online"}) ;     
    } catch (e) {
      console.log(e.message);

      
    }


  });  

  //Pay for ticket by subscription
    app.post("/api/v1/tickets/purchase/subscription", auth , async function (req, res) {
    const {subid,origin,destination,tripDate }= req.body;
    // console.log(subId,origin,destination,tripDate )
    try{
      const user = await getUser(req);
      const user_id=user.userid;
      let n = await db.select("nooftickets").from("se_project.subsription").where("userid",user_id)

      .then((rows) => rows.map((row) => row.nooftickets));
      // console.log(n,n.length);
      if(n.length==0){
        return res.status(400).json({error: "you don't have a subsription "}) ;     
        }
        
      else{
        const ticketExists = await db.select("id").from("se_project.tickets")
        .where({
          userid: user_id,
          origin: origin,
          destination: destination,
          tripdate : tripDate
        }).then((rows) => rows.map((row) => row.id));
        // console.log(ticketExists);

        if(ticketExists!=0){
          return res.status(400).json({error: "ticketExists"}) ;     
        }
        // console.log(n[0]);

      if(n[0]==0){
        return res.status(400).json({error: "you don't have a tickets left in your subsription "}) ;     
      }
      else{
        n[0]=n[0]-1;
        let id = await db.select("id").from("se_project.subsription").where("userid",user_id).then((rows) => rows.map((row) => row.id));     

        await db("se_project.subsription")
          .where({ "id": subid })
          .update({ nooftickets: n[0] });

          const tic = {
            origin:origin,
            destination:destination,
            userid:user_id,
            tripdate:tripDate,
            subid:id[0]
           };
          //  console.log("tic",tic)
      
           await db("se_project.tickets").insert(tic);
         

           const t_id = await db.select("id").from("se_project.tickets")
           .where({
             userid: user_id,
             origin: origin,
             destination: destination,
             tripdate : tripDate
           }).then((rows) => rows.map((row) => row.id));     

     const r ={
      status:"upcoming",
      origin:origin,
      destination:destination,
      userid:user_id,
      tripdate:tripDate,
      ticketid:t_id[0]
    };
    const s = "subsription"

    // console.log("r",r); 
    await db("se_project.rides").insert(r);
    const tran={
      amount:1 ,
      userid:user_id ,
      purchasediid:t_id,
      purchase_type:s,

    };
      
    const stations = await db.select("*").from("se_project.stations");
    const routes = await db.select("*").from("se_project.routes");
  
    // console.log(origin,"---",destination)
  const Path = get_path(stations,routes,origin,destination) 
  // console.log(Path)
  let distance = Path.length;
  let price =0;
  if(distance<=9){
      price = await db.select("price").from("se_project.zones").where("zonetype","1").then((rows) => rows.map((row) => row.price));
  }
  else if(distance>9 && distance<=16){
    price = await db.select("price").from("se_project.zones").where("zonetype","2").then((rows) => rows.map((row) => row.price));
}
else if(distance<=9){
  price = await db.select("price").from("se_project.zones").where("zonetype","3").then((rows) => rows.map((row) => row.price));
}
let way=get_way(Path)
// console.log( 'price:',price[0] )  
//console.log(  'Path: '+way+' price: '+price[0] +"pounds")
return res.status(200).json({ message: 'Path: '+way+' price: '+price[0] +"pounds",Number: distance,pp:Path} );
  
          // return res.status(200).json({message: "tickets purchased"}) ;     

            }      }}
      catch (e) { console.log(e.message);
      }
        });

  //-------------------------------------------------------------------------------------------------------------------------------
// (refund ticket)
app.post("/api/v1/refund/:ticketId" ,async function (req,res){
  try {
    const { ticketId } = req.params;

    const ticket = await db
      .select("*")
      .from("se_project.tickets")
      .where("id", ticketId);

    const refundTicket = await db
      .select("*")
      .from("se_project.refund_requests")
      .where("ticketid", ticketId);
    if (ticket.length==0) {
      return res.status(404).json({ error: "Ticket Not Found" });
    }
    if(refundTicket.length>0){
      return res.status(400).json({ error: 'Refund Still Being Reviewed' });
    }
     
    

     const user = await getUser(req);
    const datee = await db
      .select("tripdate")
      .from("se_project.tickets")
      .where("id", ticketId).then((rows) => rows.map((row) => row.tripdate));
    const currDate = new Date();
    console.log(currDate,"-------"  ,datee[0])

    if (datee[0] < currDate){
      return res.status(400).json({ error: "Cannot refund past or current date tickets" });
    };
    const stations = await db.select("*").from("se_project.stations");
    const routes = await db.select("*").from("se_project.routes");
    const origin = ticket[0].origin
    const destination = ticket[0].destination
      console.log(origin,"--",destination)
  const Path = get_path(stations,routes,origin,destination) 
   console.log(Path)
  let distance = Path.length;
  let price =0;
  if(distance<=9){
      price = await db.select("price").from("se_project.zones").where("zonetype","1").then((rows) => rows.map((row) => row.price));
  }
  else if(distance>9 && distance<=16){
    price = await db.select("price").from("se_project.zones").where("zonetype","2").then((rows) => rows.map((row) => row.price));
}
else if(distance<=9){
  price = await db.select("price").from("se_project.zones").where("zonetype","3").then((rows) => rows.map((row) => row.price));
}
    const refundRequest = {
      status: "pending",
      userid: user.userid,
      refundamount: price[0],
      ticketid: ticketId,
    };
    console.log(refundRequest)
    await db("se_project.refund_requests").insert(refundRequest);

    return res.status(200).json({ message: "Ticket Is Added To Refund List." });


  } catch (error) {
    return res.status(400).json({ error: 'Failed to submit refund request' });

  }

});
// senior request
app.post("/api/v1/senior/request", async function (req,res)  {
  
  const {nationalId} = req.body;
  console.log(typeof(nationalId));
  
  const user = await getUser(req);

  const requests_Exists = await db.select("status").from("se_project.senior_requests")
  .where("userid",user.userid).then((rows) => rows.map((row) => row.status));
 
  try {    
    if(nationalId.length!=14){
      return res.status(400).json({ error: 'nationalId should be 14 digit' }); 

    }  
    if(requests_Exists == "pending"){
      return res.status(409).json({ error: 'Already Requsted ' }); 
    }
      const seniorrequests = {
        status: "pending",
        userid: user.userid,
        nationalid:nationalId 
     
      };
      console.log(seniorrequests)

      await db("se_project.senior_requests").insert(seniorrequests);
      return res.status(200).json({ message: "Request Submitted." });
    
    
  } catch (error) {
    return res.status(400).json({ error: 'Failed To Submit Request' });
  }

});

//(simulate ride)
app.put("/api/v1/ride/simulate",async(req,res)=>{
 
  const {origin , destination , tripDate} = req.body;
  if (!origin || !destination || !tripDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const user = await getUser(req);
  
  try {
    const rideExists = await db.select("status").from("se_project.rides")
    .where({
      userid: user.id,
      origin: origin,
      destination: destination,
      tripdate : tripDate
    }).then((rows) => rows.map((row) => row.status));
    
    const id = await db.select("id").from("se_project.rides")
    .where({
      userid: user.id,
      origin: origin,
      destination: destination,
      tripdate : tripDate
    }).then((rows) => rows.map((row) => row.id));
    //console.log("rideExists",rideExists);
    //console.log("id",id);

    if (id.length>0) {
      
      if (rideExists[0] === "Completed") {
        res.status(200).json({ message: "Ride has already been completed" });
      } else {
        await db("se_project.rides")
          .where({ "id": id[0] })
          .update({ status: "Completed" });

        return res.status(200).json({ message: "Ride simulated successfully" });
      }
    } else {
      res.status(404).json({ message: "Ride not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to simulate ride" });
  } 

});


//--------------------------------------------------------------------

function findShortestPath(graph, startNode, endNode) {
  if (!graph.has(startNode) || !graph.has(endNode)) {
    return null; 
  }
  const visited = new Set();
  const queue = [[startNode, 0, [startNode]]]; 
  while (queue.length > 0) {
    const [currentNode, distance, path] = queue.shift();

    if (currentNode === endNode) {
      return path; 
    }

    if (!visited.has(currentNode)) {
      visited.add(currentNode);

      const neighbors = graph.get(currentNode);

      for (const neighbor of neighbors) {
        queue.push([neighbor, distance + 1, [...path, neighbor]]);
      }
    }
  }

  return null; 
}

function get_graph(stations, routes) {
  const graph = new Map();

  for (const station of stations) {
    const nodeId = station.stationname;
    graph.set(nodeId, []);
  }

  
  for (const route of routes) {
    const fromStationId = route.fromstationid;
    const toStationId = route.tostationid;
  
    
    let fromStation;
    let toStation;
  
    for (const station of stations) {
      if (station.id === fromStationId) {
        fromStation = station.stationname;
      }
      if (station.id === toStationId) {
        toStation = station.stationname;
      }
    }
    //const fromStation = stations.find((station) => station.stationname === `s${fromStationId}`);
    //const toStation = stations.find((station) => station.stationname === `s${toStationId}`);
    //console.log("fromStation:" , fromStation);
    //console.log("toStation: ",toStation );

    graph.get(fromStation).push(toStation);
    //graph.get(toStation.stationname).push(fromStation.stationname);

  }
 //console.log(graph);

  return graph; 
}
function get_path  (stations,routes,originId_name,destinationId_name){ 
  const graph = get_graph(stations, routes);
   const Path = findShortestPath(graph, originId_name, destinationId_name);
  //  console.log(Path)
  return Path
}
function get_way(Path){
  let output ="";
  for(i in Path){
    output = output+Path[i]+ "->"
  }
  //console.log(output)
  return  output.slice(0, -2);;
}
// check price
app.get("/api/v1/tickets/price/:originId/:destinationId", async (req, res) => {
  try{
  const { originId, destinationId } = req.params;
    const stations = await db.select("*").from("se_project.stations");
    const routes = await db.select("*").from("se_project.routes");
  
    const originId_name = await db
      .select("stationname")
      .from("se_project.stations")
      .where("id", originId)
      .then((rows) => rows.map((row) => row.stationname));
    const destinationId_name = await db
      .select("stationname")
      .from("se_project.stations")
      .where("id", destinationId)
      .then((rows) => rows.map((row) => row.stationname));

  const Path = get_path(stations,routes,originId_name[0],destinationId_name[0]) //findShortestPath(graph, originId_name[0], destinationId_name[0]);
  let distance = Path.length;
  let price =0;
  if(distance<=9){
      price = await db.select("price").from("se_project.zones").where("zonetype","1").then((rows) => rows.map((row) => row.price));
  }
  else if(distance>9 && distance<=16){
    price = await db.select("price").from("se_project.zones").where("zonetype","2").then((rows) => rows.map((row) => row.price));
}
else if(distance<=9){
  price = await db.select("price").from("se_project.zones").where("zonetype","3").then((rows) => rows.map((row) => row.price));
}
return res.status(200).json({ message: price[0] +"pounds"});
}
catch (error) {
  return res.status(400).json({ error: 'Failed to check price' });

}




});


  //------------------------------------------------------------------------------------------------------------
//get zone
app.get('/api/v1/zones',async (req,res) => {
  try {
   
   const db1=
   await db
   .select("*")
   .from("se_project.zones") 
  
     
     return res.status(200).send(db1);
  } catch (err) 
   {
     
     console.error(err.message);
     return res.status(300).json({ error: 'could not retunr zones' });
  }
   


 });
 // reset pawword
 app.put('/api/v1/password/reset', async(req, res) => {
  try {
    const userr = await getUser(req);
    const userId = userr.userid;
    const { newPassword, OldPassword } = req.body;

    // Find the user in the database by their id from the session
    const [user] = await db('se_project.users')
      .where({ id: userId })
      .select('password');

    if (user.password !==OldPassword) {
      return res.status(300).json({ message: 'Incorrect old Password' });
    } else {
      await db('se_project.users')
        .where({ id: userId })
        .update({ password: newPassword });

      return res.status(200).json({ message: 'Password reset successfully' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
//-----------------------------------------------LOFFY-------------------------------------------------------------------
app.get("/api/v1/requests_refunds", auth, authorization, async (req, res) => {
  try {
    const user = await getUser(req);
    console.log(user);

    const allRefundReqs = await db
      .select("refund_requests.*", "rides.status as ride_status")
      .from("se_project.refund_requests")
      .leftJoin("se_project.rides", "refund_requests.ticketid", "=", "rides.ticketid")
      .where("refund_requests.status", "pending");

    return res.status(200).json(allRefundReqs);
  } catch (err) {
    console.error(err.message);
  }
});
app.put(
  "/api/v1/requests/refunds/:id",
  auth,
  authorization,
  async (req, res) => {
    try {
      const user = await getUser(req);
      const refundRequest = await db("se_project.refund_requests")
        .where("id", req.params.id)
        .first();
      console.log(refundRequest.ticketid);
      if (req.body.status === "Accepted") {
        await db("se_project.rides")
          .where("ticketid", refundRequest.ticketid)
          .del();
      }
      const updateStatus = await db("se_project.refund_requests")
        .where("id", req.params.id)
        .update({
          status: req.body.status,
        });
      console.log(req.params.id);
      return res.status(200).json();
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
app.get("/api/v1/requests_senior",
  auth,
  authorization,
  async (req, res) => {
    try {
      const user = await getUser(req);
      const seniorRequests = await db('se_project.senior_requests').select('*').where("status","pending");
      const nid = seniorRequests[0].nationalid;
      console.log(seniorRequests[0])
      const requestsWithAge = seniorRequests.map(request => ({ ...request, age: calculateAge(request.nationalid.toString()) }));
                  return res.status(200).json(requestsWithAge);
    } catch (err) { 
      console.log(err.message);
    }
  })
app.put(
  "/api/v1/requests_senior/:id",
  auth,
  authorization,
  async (req, res) => {
    try {
      const user = await getUser(req);
      const { id } = req.params.id;
      const updateSatus = await db("se_project.senior_requests")
        .where("id", req.params.id)
        .update({
          status: req.body.status,
        });
      return res.status(200).json();
    } catch (err) {
      console.log(err.message);
    }
  }
);
app.get("/api/v1/zones", auth, authorization, async (req, res) => {
  try {
    const user = await getUser(req);
    const allZones = await db("se_project.zones").select('*')
    return res.status(200).json(allZones);
  } catch (err) {
    console.log(err.message);
  }
})
app.put("/api/v1/zones/:id", auth, authorization, async (req, res) => {
  try {
    console.log("Hi");
    console.log(req.body.price);
    const user = await getUser(req);
    const { id } = req.params;
    const updatePrice = await db("se_project.zones")
      .where("id", id)
      .update({
        price: req.body.price
      })
    res.status(200).send("Zone price updated successfully");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error updating zone price");
  }
});
};

