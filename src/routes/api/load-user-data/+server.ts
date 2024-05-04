import UserDataTable from '$lib/models/UserDataTable';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const uniqueId = url.searchParams.get('uniqueId');

	if (uniqueId === null) {
		return new Response('none');
	}

	let user = await UserDataTable.findOne({
		where: {
			uniqueId: uniqueId
		}
	});

	if (user) {
		return new Response(
			JSON.stringify({
				playerItems: user.items,
				playerCombinaisons: user.combinaisons
			})
		);
	}

	return new Response('none');
}
