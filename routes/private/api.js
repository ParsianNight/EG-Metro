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

  user.isNormal = user.roleId === roles.user;
  user.isAdmin = user.roleId === roles.admin;
  user.isSenior = user.roleId === roles.senior;
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
    console.log('here3');
    
    try {
    const{email, newPassword}= req.body;
  
    console.log(email +' '+ newPassword);
  
    // Find the user in the database by their email address
        await db("se_project.users") 
        .where({email : email })
        .update({ password: newPassword })
        .then(() => {
          return res.status(200).json({ message: 'Password reset successfully' });
      })
        
      .catch((err) => {
        console.error(err.message);
        return res.status(300).json({ error: 'Internal server error' });
      });
  
  } catch (error) {
  console.error(error.message);
      
  }});


};
