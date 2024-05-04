import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from '@sequelize/core';

import { Attribute, PrimaryKey, AutoIncrement, NotNull } from '@sequelize/core/decorators-legacy';

export default class ItemTable extends Model<InferAttributes<ItemTable>, InferCreationAttributes<ItemTable>> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	declare id: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare name: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare emoji: string;
}
