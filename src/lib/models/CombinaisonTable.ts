import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from '@sequelize/core';

import { Attribute, PrimaryKey, AutoIncrement, NotNull } from '@sequelize/core/decorators-legacy';

export default class CombinaisonTable extends Model<InferAttributes<CombinaisonTable>, InferCreationAttributes<CombinaisonTable>> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	declare id: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare firstWord: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare secondWord: string;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare result: number;
}
