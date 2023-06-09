const { v4 } = require("uuid");
const db = require("../connectors/db");
const roles = require("../constants/roles");
const { getSessionToken } = require("../utils/session");

module.exports = async function (req, res, next) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/login");
  }

  const userid = await db
    .select("userid")
    .from("se_project.sessions")
    .where("token", sessionToken)
    .first();
  const roleId = await db
    .select("roleid")
    .from("se_project.users")
    .where("id", userid.userid)
    .first();
    console.log(roleId.roleid)
    if(roleId.roleid == roles.admin) {
        next();
    }else{
        return res.status(401).redirect('/unauthorized').render('401');
       }
};