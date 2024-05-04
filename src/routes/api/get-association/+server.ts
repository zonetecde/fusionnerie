import CombinaisonTable from '$lib/models/CombinaisonTable';
import Item from '$lib/models/Item';
import ItemTable from '$lib/models/ItemTable';
import sequelize from '$lib/server';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const firstWord = url.searchParams.get('firstWord');
	const secondWord = url.searchParams.get('secondWord');

	if (firstWord === null || secondWord === null) {
		return new Response('none');
	}

	// Regarde si la combinaison n'existe pas déjà dans la db
	let combinaison = await CombinaisonTable.findOne({
		where: {
			firstWord: firstWord,
			secondWord: secondWord
		}
	});

	if (!combinaison) {
		combinaison = await CombinaisonTable.findOne({
			where: {
				firstWord: secondWord,
				secondWord: firstWord
			}
		});
	}

	if (combinaison) {
		// Retourne alors le résultat de la combaison là
		const resultat = await ItemTable.findByPk(combinaison.result);
		if (resultat) {
			return new Response(JSON.stringify(new Item(resultat.emoji, resultat.name, false)));
		}
	}

	try {
		// Requête à l'IA (sur mon serveur local)
		return await askGpt(firstWord, secondWord);
	} catch (e: any) {
		// Refait une requête à l'IA (deuxième essai)
		try {
			console.log('deuxième essai');
			return await askGpt(firstWord, secondWord);
		} catch (e: any) {
			console.log(e);
		}
	}

	// Combinaison impossible
	return new Response('none');
}
async function askGpt(firstWord: string, secondWord: string) {
	let response = await fetch(
		`http://localhost:6969/gpt?prompt=🎲 Here's a challenge for you in a word combination game! You'll receive two words, and you'll need to give me the word that best fits the combination of these two. Respond with a single word and use an emoji that closely resembles the word you're writing.\n\nExample: if I give you "Chocolate" and "Store", your response should be: "Chocolaterie" with the emoji 🍫. You can provide an adjective, a noun, a proper noun, a city, a movie, a game, etc., but make sure the word exists in the dictionary.\nWhen both words are identical, you can propose an 'amplified' version of the thing. For example, for "rich" + "rich", you could answer: "The richest".\n\nWrite your response in JSON format, with two attributes: emoji (string) and name (string, representing the word in FRENCH).\n\nThe two words to combine are '${firstWord}' and '${secondWord}'. Don't forget to choose a relevant emoji for your response! If your response is 'Tornade' for example, your emoji should be 🌪️\n\n\n\nTwo same words should not give the same word in plural. Moreover, two words should not be fused together, like for exemple : earth and air should not give earth-air, but for exemple, wind. You should ALWAYS give a different word than the words I gave you. Moreover, the anwser can be an action. For exemple, "Sapeur-Pompier" with "incendie" should be "Sauvegate". Incendie et crash devrait donner 'Catastrophe'`
	);

	console.log(response);
	let text = await response.json();

	// Enlève si nécessaire l'indicateur json
	if (text.startsWith('```json')) text = text.slice(7, -3);
	else if (text.startsWith('```')) text = text.slice(3, -3);

	const jsonObject = JSON.parse(text);

	// Met la première lettre en majuscule
	jsonObject.name = jsonObject.name.charAt(0).toUpperCase() + jsonObject.name.slice(1);

	let emojisArray = jsonObject.emoji.match(/\p{Emoji}+/gu) || [];
	let emojisString = emojisArray.join('');

	if (emojisString === '') jsonObject.emoji = '⬜';

	// Ajoute la combinaison et l'item à la db
	const item = await ItemTable.findOrCreate({
		where: sequelize.where(
			sequelize.fn('lower', sequelize.col('name')),
			sequelize.fn('lower', jsonObject.name)
		),
		defaults: {
			name: jsonObject.name,
			emoji: jsonObject.emoji
		}
	});

	await CombinaisonTable.create({
		firstWord: firstWord,
		secondWord: secondWord,
		result: item[0].id
	});

	return new Response(JSON.stringify(new Item(item[0].emoji, item[0].name, item[1])));
}
