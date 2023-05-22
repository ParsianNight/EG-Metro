const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session');
const auth = require("../../middleware/auth");
const getUser = async function (req) {
const sessionToken = getSessionToken(req);

//(MO
const express = require('express');
const app = express();

app.put('/api/v1/password/reset', (req, res) => {
  // Get the email, resetToken, and newPassword from the request body
  const { email,newPassword } = req.body;

  // Find the user in the database by their email address
  knex('user')
    .where({ email })
    .first()
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }


      // Update the user's password with the new passwordgit
      knex('users')
        .where({ id: user.id })
        .update({ password: newPassword})
        .then(() => {
          return res.status(200).json({ message: 'Password reset successfully' });
        })
        .catch((err) => {
          console.error(err.message);
          
        });
    })
    .catch((err) => {
      console.error(err.message);
      
    });
});

app.get('/api/v1/zones',async(req,res)=>{




});

//MO)

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

  
};
