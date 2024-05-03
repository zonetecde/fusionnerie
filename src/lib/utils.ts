export function randomNumber(min: number, max: number) {
	return Math.round(Math.random() * (max - min)) + min;
}

/**
 *  Fonction qui retourne si deux éléments se touchent
 * @param el1 L'élément 1
 * @param el2  L'élément 2
 * @param margeErreur  La marge d'erreur
 * @returns  Si les deux éléments se touchent
 */
export function checkCollision(el1: any, el2: any, margeErreur: number = 15) {
	const rect1 = el1.getBoundingClientRect();
	const rect2 = el2.getBoundingClientRect();

	return (
		rect1.top <= rect2.bottom - margeErreur &&
		rect1.right >= rect2.left + margeErreur &&
		rect1.bottom >= rect2.top + margeErreur &&
		rect1.left <= rect2.right - margeErreur
	);
}

export function checkSearchFilter(search: string, itemName: string) {
	// Enlève les accents, les espaces et met en minuscule
	search = search
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s/g, '')
		.toLowerCase();
	itemName = itemName
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s/g, '')
		.toLowerCase();

	return itemName.includes(search);
}
