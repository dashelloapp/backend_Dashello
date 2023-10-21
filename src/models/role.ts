import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare roleId: number;
  declare name: string;
  declare description: string;
}

export function roleFactory(sequelize: Sequelize) {
  Role.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      tableName: 'roles',
      sequelize,
      collate: 'utf8_general_ci',
    }
  );
}
