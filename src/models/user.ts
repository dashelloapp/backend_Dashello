import { BelongsTo, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import { organization } from "./organization";
import { Role } from "./role";


export class user extends Model<InferAttributes<user>, InferCreationAttributes<user>>{
    declare userId: number;
    declare organizationId: number;
    declare roleID: number;
    declare email: string;
    declare password: string;
    declare firstName: string;
    declare lastName: string;
    declare userType: string;
    declare profilePicture: string;
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
        roleID: {
            type:DataTypes.INTEGER,
            allowNull: false

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
    organization.hasMany(user, { foreignKey: "organizationId" });
    Role.belongsTo(user,{ foreignKey: "roleId"});
    user.belongsTo(organization, { foreignKey: "organizationId" });
}