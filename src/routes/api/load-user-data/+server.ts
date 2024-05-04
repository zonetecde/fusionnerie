import UserDataTable from '$lib/models/UserDataTable';

/**
 * Charge les données d'un utilisateur sauvées
 */
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	// Récupère l'uniqueId de l'utilisateur
	const uniqueId = url.searchParams.get('uniqueId');

	if (uniqueId === null) {
		return new Response('none');
	}

	// Récupère les données de l'utilisateur
	let user = await UserDataTable.findOne({
		where: {
			uniqueId: uniqueId
		}
	});

	if (user) {
		// Retourne les données de l'utilisateur
		return new Response(
			JSON.stringify({
				playerItems: user.items,
				playerCombinaisons: user.combinaisons
			})
		);
	}

	return new Response('none');
}
