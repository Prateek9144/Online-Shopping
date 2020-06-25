const { Sequelize } = require('sequelize');


const sequelize = new Sequelize("node-complete", "root", "Prateek9144", {
  host: "localhost",
  dialect: "mysql"
});


module.exports = sequelize;