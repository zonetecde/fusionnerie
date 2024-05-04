import ItemTable from '$lib/models/ItemTable';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	return new Response(JSON.stringify(await ItemTable.count()));
}
