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
app.post("/api/v1/refund/:ticketId" ,async function (req,res){
  try {
    const { ticketId } = req.params;
    console.log(ticketId)
    // const s ={
    //   subtype="annual"
    // }

    // const t={
  
    //   origin: "1",
    //   destination: "5",
    //   userid: 2,

    //   tripdate:
      
    // }
    // await db("se_project.tickets").insert(t);

    const ticket = await db
      .select("*")
      .from("se_project.tickets")
      .where("id", ticketId);
      console.log("ticket",ticket)

    const refundTicket = await db
      .select("*")
      .from("se_project.refund_requests")
      .where("ticketid", ticketId);
    console.log("refundTicket",refundTicket)
    if (ticket.length==0) {
      return res.status(404).json({ error: "Ticket Not Found" });
    }
    if(refundTicket.length>0){
      return res.status(400).json({ error: 'Refund Still Being Reviewed' });
    }
     
    

    const user = await getUser(req);
    if (ticket.userid !== user.id) {
      return res.status(403).json({ error: "Unauthorized to refund this ticket" });
    }

    const currDate = new Date();
    const ticketDate = new Date(ticket.tripdate);

    if (ticketDate >= currDate){
      return res.status(400).json({ error: "Cannot refund past or current date tickets" });
    };

     
    const refundRequest = {
      status: "pending",
      userid: user.id,
      refundamount: 5,
      ticketid: ticketId,
    };
    await db("se_project.refund_requests").insert(refundRequest);
    return res.status(200).json({ message: "Ticket Is Added To Refund List." });


  } catch (error) {
    return res.status(400).json({ error: 'Failed to submit refund request' });

  }

});
//DONE
app.post("/api/v1/senior/request", async function (req,res)  {
  console.log("dfghn");
  const {nationalId} = req.body;
  console.log(nationalId);
  const user = await getUser(req);
 
  
  try {

      const seniorrequests = {
        status: "pending",
        userid: user.userid,
        nationalid:nationalId 
     
      };
      await db("se_project.senior_requests").insert(seniorrequests);
      return res.status(200).json({ message: "Request Submitted." });
    
    
  } catch (error) {
    return res.status(400).json({ error: 'Failed To Submit Request' });
  }

});


app.put("/api/v1/ride/simulate",async(req,res)=>{
  console.log("sdfgh");
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
    });
    console.log(rideExists)
    if (rideExists.length>0) {
      if (rideExists === "Completed") {
        res.status(200).json({ message: "Ride has already been completed" });
      } else {
        await db("se_project.rides")
          .where({ id: rideExists.id })
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


/*
//index
  const startIndex = stations.findIndex(station => station.id === originId);
  const endIndex = stations.findIndex(station => station.id === destinationId);
*/

}
