import CombinaisonTable from '$lib/models/CombinaisonTable';
import ItemTable from '$lib/models/ItemTable';
import sequelize from '$lib/server';

/**
 * Récupère tous les items et combinaisons
 */
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const allItems = await ItemTable.findAll();
	const allCombinaisons = await CombinaisonTable.findAll();

	let newCombinaisons: any[] = [];

	await Promise.all(
		allCombinaisons.map(async (combinaison) => {
			const name = (await ItemTable.findByPk(combinaison.result))!.name;
			newCombinaisons.push({
				firstWord: combinaison.firstWord,
				secondWord: combinaison.secondWord,
				result: name
			});
		})
	);

	return new Response(JSON.stringify([allItems, newCombinaisons]));
}
