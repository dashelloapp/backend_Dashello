import { Sequelize } from "sequelize";
import { organizationFactory } from "./organization";
import { AssociateUserOrganization, userFactory } from "./user";

const dbName = 'dashello';
const username = 'root';
const password = '0624';

const sequelize = new Sequelize(dbName, username, password, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});

organizationFactory(sequelize)
userFactory(sequelize)
AssociateUserOrganization()

export const db = sequelize;