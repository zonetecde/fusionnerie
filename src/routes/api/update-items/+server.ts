import ItemTable from '$lib/models/ItemTable';
import sequelize from '$lib/server';

/**
 * Met à jour les emojis des items de l'utilisateur
 */
/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	const body = await request.json();

	// Récupère les données
	if (body === null) {
		return new Response('Erreur');
	}

	// Met à jour les emojis des items de l'utilisateur
	await Promise.allSettled(
		body.map(async (item: any) => {
			const { emoji, name, id } = item;

			// Met à jour l'item
			const itemInDb = await ItemTable.findOne({
				where: {
					name: name
				}
			});

			if (itemInDb) {
				item.emoji = itemInDb.emoji;
			}
		})
	);

	// Retourne les items avec les emojis mis à jour
	return new Response(JSON.stringify(body));
}
