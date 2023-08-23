import { Sequelize } from "sequelize";

const dbName = '';
const username = '';
const password = '';

const sequelize = new Sequelize(dbName, username, password, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});

export const db = sequelize;