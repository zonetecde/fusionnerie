import { randomNumber } from '$lib/utils';

export default class Item {
	emoji: string;
	name: string; // Le nom de l'item (emoji + nom)
	firstDiscovery: boolean; // Est-ce que c'est le premier joueur à avoir découvert cet item ?

	id: number; // Id unique permettant de différencier les items
	x: number; // Position x de l'item dans le playground/pendant le drag
	y: number; // ""

	checkForAssociation: boolean = false; // Est-ce que l'item doit être vérifié pour une association dès son placement ?

	constructor(emoji: string, name: string, firstDiscovery: boolean) {
		this.id = randomNumber(1, 9999999999); // Génère un id unique pour l'item

		this.emoji = emoji;
		this.name = name;
		this.firstDiscovery = firstDiscovery;

		// Si ces coordonnées sont gardées elles seront remplacées par des aléatoires lors du placement
		this.x = -1;
		this.y = -1;
	}
}
