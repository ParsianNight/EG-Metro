const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const { getSessionToken } = require('../../utils/session');
const auth = require("../../middleware/auth");
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);

  const express = require('express');
  const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

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

  user.isNormal = user.roleid === roles.user;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;
  return user;
};





//   .catch(error => {
//     console.error(error.message);
//     alert("An error occurred while resetting the password");
//   });
// }

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

 
// password reset 
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

// get Zones
  app.get('/api/v1/zones',async (req,res) => {
   try {
    
    const db1=
    await db
    .select("*")
    .from("se_project.zones") 
    return db1;
      
      return res.status(200).json({message: "Zones Data are shown successfully"})
   } catch (err) 
    {
      
      console.error(err.message);
      return res.status(300).json({ error: 'could not retunr zones' });
   }
    


  })

  // Pay for subscription online 

app.post('/api/v1/payment/subsription', async (req,res)=>{

    const {userId , subscriptionType  , ZoneId, PurchaseId} = req.body;
    // const userId = req.session.userId;
     
    let numTickets;
    console.log(subscriptionType + " " , userId,ZoneId)
  switch (subscriptionType) {
    case 'annual':
      numTickets = 100;
      await db("se_project.subsription")
      .select('*')
      .where({userid:userId})
      .then(async (rows) => {
        if (rows.length > 0) {
          console.log('User already subscriped, Subscription Updated to : annual');
             await db('se_project.subsription')
            .where('userid', userId)
            .update({ subtype:"annual", nooftickets:numTickets , zoneid : ZoneId })
            .then(()=> {
              return res.status(200).json({message: "Subscriped successfully"})
            })  
        } else {
          
           await db('se_project.subsription')
          .insert({userid:userId , subtype:"annual", nooftickets:numTickets , zoneid : ZoneId })
          .then(()=> {
            return res.status(200).json({message: "User already subscriped, Subscription Updated to : annual"})
          })  
        }
  })
break;
    case 'quarterly':
      numTickets = 50;
      await db("se_project.subsription")
     .select('*')
      .where({userid:userId})
      .then(async (rows) => {
        if (rows.length > 0) {
          console.log('User already subscriped, Subscription Updated to : quarterly');
             await db('se_project.subsription')
            .where('userid', userId)
            .update({ subtype:"quarterly", nooftickets:numTickets , zoneid : ZoneId })
            .then(()=> {
              return res.status(200).json({message: "User already subscriped, Subscription Updated to : quarterly"})
            })  
        } else {
          
           await db('se_project.subsription')
          .insert({userid:userId , subtype:"quarterly", nooftickets:numTickets , zoneid : ZoneId })
          .then(()=> {
            return res.status(200).json({message: "Subscriped successfully"})
          })  
        }
  })
  break;

    case 'monthly':
      numTickets = 10;
      await db("se_project.subsription")
      .select('*')
       .where({userid:userId})
       .then(async (rows) => {
         if (rows.length > 0) {
           console.log('User already subscriped, Subscription Updated to : Monthly');
              await db('se_project.subsription')
             .where('userid', userId)
             .update({ subtype:"monthly", nooftickets:numTickets , zoneid : ZoneId })
             .then(()=> {
              return res.status(200).json({message: 'User already subscriped, Subscription Updated to : Monthly'})
            })  
         } else {
           
            await db('se_project.subsription')
           .insert({userid:userId , subtype:"monthly", nooftickets:numTickets , zoneid : ZoneId })
           .then(()=> {
             return res.status(200).json({message: "Subscriped successfully"})
           })  
         }
   })
   break;

    default:
      return res.status(400).json({ error: 'Invalid subscription type' });
  }

  })
}


