const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const { getSessionToken } = require('../../utils/session');
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
