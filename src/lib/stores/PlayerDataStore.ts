import type Combinaison from '$lib/models/Combinaison';
import type Item from '$lib/models/Item';
import { writable, type Writable } from 'svelte/store';

export const PlayerItems: Writable<Item[]> = writable([]);
export const PlayerCombinaisons: Writable<Combinaison[]> = writable([]);

export function savePlayerData(items: Item[], playerCombinaisons: Combinaison[]) {
	localStorage.setItem('playerItems', JSON.stringify(items));
	localStorage.setItem('playerCombinaisons', JSON.stringify(playerCombinaisons));
}
