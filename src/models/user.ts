import { BelongsTo, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import { organization } from "./organization";

export class user extends Model<InferAttributes<user>, InferCreationAttributes<user>>{
    declare userId: number;
    declare organizationId: number;
    declare role: string;
    declare email: string;
    declare password: string;
    declare firstName: string;
    declare lastName: string;
    declare userType: string;
    declare profilePicture: string;
    declare twoFactorSecret: string;
}



export function userFactory(sequelize: Sequelize) {
    user.init({
        userId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role: {
            type:DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        twoFactorSecret: {
            type: DataTypes.JSON,
            allowNull: false
        }
    },
        {
            freezeTableName: true,
            tableName: 'users',
            sequelize,
            collate: 'utf8_general_ci',
        })
}

export function AssociateUserOrganization() {
    user.belongsTo(organization, { foreignKey: "organizationId" });
    organization.hasMany(user, { foreignKey: "organizationId" });
}