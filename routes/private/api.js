const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session');
const auth = require("../../middleware/auth");
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

    const ticket = await db
      .select("*")
      .from("se_project.tickets")
      .where("id", ticketId);
     
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
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
        refundamount: ticket.price,
        ticketid: ticketId,
      };
      await db("se_project.refund_requests").insert(refundRequest);
      return res.status(200).json({ message: "Ticket Is Added To Refund List." });


  } catch (error) {
     res.status(500).json({ error: 'Failed to submit refund request' });

  }

});


  
};
