"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const sequelize_1 = require("sequelize");
const organization_1 = require("./organization");
const user_1 = require("./user");
const dbName = 'dashello';
const username = 'root';
const password = '0624';
const sequelize = new sequelize_1.Sequelize(dbName, username, password, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});
(0, organization_1.organizationFactory)(sequelize);
(0, user_1.userFactory)(sequelize);
(0, user_1.AssociateUserOrganization)();
exports.db = sequelize;
