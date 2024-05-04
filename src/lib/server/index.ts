import CombinaisonTable from '$lib/models/CombinaisonTable';
import ItemTable from '$lib/models/ItemTable';
import UserDataTable from '$lib/models/UserDataTable';
import { Sequelize } from '@sequelize/core';
import dotenv from 'dotenv';

dotenv.config();
const connString = process.env.DATABASE_URL;
const sequelize = new Sequelize(connString!, { logging: false });

if (!ItemTable.isInitialized()) {
	sequelize.addModels([ItemTable]);
}
if (!CombinaisonTable.isInitialized()) {
	sequelize.addModels([CombinaisonTable]);
}
if (!UserDataTable.isInitialized()) {
	sequelize.addModels([UserDataTable]);
}

sequelize.sync({ alter: true });

try {
	await sequelize.authenticate();
	console.log('Connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

export default sequelize;
