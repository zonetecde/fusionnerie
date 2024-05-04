import { randomNumber } from '$lib/utils';

export default class Item {
	emoji: string;
	name: string; // Le nom de l'item (emoji + nom)
	firstDiscovery: boolean; // Est-ce que c'est le premier joueur à avoir découvert cet item ?

	id: number;
	x: number;
	y: number;
	checkForAssociation: boolean = false;

	constructor(emoji: string, name: string, firstDiscovery: boolean) {
		this.emoji = emoji;
		this.name = name;
		this.firstDiscovery = firstDiscovery;
		this.id = randomNumber(1, 9999999999);
		this.x = -1;
		this.y = -1;
	}
}
