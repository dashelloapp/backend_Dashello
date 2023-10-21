import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import { user } from "./user";

export class organization extends Model<InferAttributes<organization>, InferCreationAttributes<organization>>{
    declare organizationId: number;
    declare organization: string;
    declare organizationUsers: string;
    declare billing_address: string;
    declare mailing_address: string;
    declare card_information: string;
    declare membership_plan: string;
    declare metricId: number;

  
}

export function organizationFactory(sequelize: Sequelize) {
    organization.init({
        organizationId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        organization: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        organizationUsers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        //Users will be converted to an array to hold all of the organization's users.
        billing_address: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        mailing_address: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        //billing and mailing address' will be formatted like this
        // {
        //     street: "",
        //     city: "",
        //     state: "",
        //     zip: ""
        // }
        card_information: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        //Card information will be formatted like this
        // {
        //     cardHolder: "",
        //     cardNumber: "",
        //     exp: "",
        //     cvc: ""
        // }
        membership_plan: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        metricId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
        {
            freezeTableName: true,
            tableName: 'organization',
            sequelize,
            collate: 'utf8_general_ci',
        })
}

// export function AssociateUserOrganization() {
//     organization.hasMany(user, { foreignKey: "userId" });
//     user.belongsTo(organization, { foreignKey: "userId" });
// }

// Need Metric Model
// export function AssociateMetricOrganization() {
//     organization.hasMany(metric { foreignKey: "metricId" });
//     metric.belongsTo(organization, { foreignKey: "metricId" });
// }