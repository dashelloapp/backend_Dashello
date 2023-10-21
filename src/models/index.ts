import { Sequelize } from "sequelize";
import { AssociateUserOrganization } from "./user";
import {organizationFactory } from "./organization";

const dbName = '';
const username = '';
const password = '';

const sequelize = new Sequelize(dbName, username, password, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});

organizationFactory(sequelize)
AssociateUserOrganization()

export const db = sequelize;