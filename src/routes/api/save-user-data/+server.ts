import ItemTable from '$lib/models/ItemTable';
import UserDataTable from '$lib/models/UserDataTable';
import sequelize from '$lib/server';

/**
 * Sauvegarde les données d'un utilisateur
 */
/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	const body = await request.json();

	// Récupère ses données
	const uniqueId = body.uniqueId;
	const playerItems = body.playerItems;
	const playerCombinaisons = body.playerCombinaisons;

	if (!uniqueId || !playerItems || !playerCombinaisons) {
		return new Response('Erreur');
	}

	// Si l'utilisateur existe déjà, met à jour ses données
	const existingUser = await UserDataTable.findOne({
		where: {
			uniqueId: uniqueId
		}
	});

	if (existingUser) {
		await UserDataTable.update(
			{
				items: JSON.stringify(playerItems),
				combinaisons: JSON.stringify(playerCombinaisons)
			},
			{
				where: {
					uniqueId: uniqueId
				}
			}
		);
	} else {
		// Sinon, crée un nouvel utilisateur
		await UserDataTable.create({
			uniqueId: uniqueId,
			items: JSON.stringify(playerItems),
			combinaisons: JSON.stringify(playerCombinaisons)
		});
	}

	return new Response('Succès');
}
