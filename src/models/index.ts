import { Sequelize } from "sequelize";
import { userFactory } from "./user";
import { AssociateUserOrganization } from "./organization";

const dbName = '';
const username = '';
const password = '';

const sequelize = new Sequelize(dbName, username, password, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});

userFactory(sequelize)
AssociateUserOrganization()

export const db = sequelize;