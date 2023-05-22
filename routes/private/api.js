const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session');
const auth = require("../../middleware/auth");
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




    var station = await db("se_project.stations").where("id",req.params.id).update(updateStation);
    if(station == 0) {
      throw new Error("error while updating a station, please try again later");
    }
    station = await db.select('*').from("se_project.stations").where("id",req.params.id)

    res.status(200).json(station);
  } catch (e) {
    console.log(e.message);
    res.status(400).send("Error occurred, please recheck the data you entered!");
  }
});
// delete a station
app.delete("/api/v1/station/:id", async function(req,res) {
  
  try{
  var station = await db("se_project.stations")
  .where("id",req.params.id)
  .del()
  if(station == 0) {
    throw new Error("station not found!");
  }
  res.status(200).send("deleted successfully!");
  } catch(e) {
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




    var station = await db("se_project.routes").where("id",req.params.id).update(updateRoute);
    if(station == 0) {
      throw new Error("error while updating a route, please try again later");
    }
    station = await db.select('*').from("se_project.routes").where("id",req.params.id)

    res.status(200).json(station);
  } catch (e) {
    console.log(e.message);
    res.status(400).send("Error occurred, please recheck the data you entered!");
  }
});  
// delete route
app.delete("/api/v1/route/:id", async function(req,res) {
  
  try{
  var station = await db("se_project.routes")
  .where("id",req.params.id)
  .del()
  if(station == 0) {
    throw new Error("route not found!");
  }
  res.status(200).send("deleted successfully!");
  } catch(e) {
    console.log(e.message)
    res.status(400).send(e.message)
  }

})


};
