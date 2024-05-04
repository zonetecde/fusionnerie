import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from '@sequelize/core';

import { Attribute, PrimaryKey, AutoIncrement, NotNull } from '@sequelize/core/decorators-legacy';

export default class UserDataTable extends Model<InferAttributes<UserDataTable>, InferCreationAttributes<UserDataTable>> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	declare id: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare uniqueId: string;

	@Attribute(DataTypes.TEXT)
	@NotNull
	declare items: string;

	@Attribute(DataTypes.TEXT)
	@NotNull
	declare combinaisons: string;
}
