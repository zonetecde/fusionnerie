import CombinaisonTable from '$lib/models/CombinaisonTable';
import ItemTable from '$lib/models/ItemTable';
import UserDataTable from '$lib/models/UserDataTable';
import { Sequelize } from '@sequelize/core';
import dotenv from 'dotenv';
import fs from 'fs';

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

	// const combinaisons = await CombinaisonTable.findAll();
	// console.log('Combinaisons :');
	// // Shuffle the combinaisons array
	// for (let i = combinaisons.length - 1; i > 0; i--) {
	// 	const j = Math.floor(Math.random() * (i + 1));
	// 	[combinaisons[i], combinaisons[j]] = [combinaisons[j], combinaisons[i]];
	// }

	// for (const combinaison of combinaisons) {
	// 	const result = await ItemTable.findOne({
	// 		where: {
	// 			id: combinaison.result
	// 		}
	// 	});
	// 	if (result) {
	// 		// write in a csv file : combinaison.firstWord + combinaison.secondWord, result.emoji result.name
	// 		console.log(combinaison.firstWord + ' + ' + combinaison.secondWord + ',' + result.emoji + ' ' + result.name);

	// 		// write in file.csv
	// 		fs.appendFileSync(
	// 			'file.csv',
	// 			combinaison.firstWord.toString() + ' + ' + combinaison.secondWord.toString() + ',' + result.emoji.toString() + ' ' + result.name + '\n'
	// 		);
	// 	} else {
	// 		console.log('Combinaison without result :', combinaison.firstWord + combinaison.secondWord);
	// 	}
	// }
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

export default sequelize;
