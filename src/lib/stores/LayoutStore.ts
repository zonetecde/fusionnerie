import type Playground from '$lib/components/Playground.svelte';
import type Combinaison from '$lib/models/Combinaison';
import type Item from '$lib/models/Item';
import { writable, type Writable } from 'svelte/store';

export const PlaygroundComponent: Writable<Playground> = writable();
export const FetchingItems: Writable<number[]> = writable([]);
export const ShowCrafts: Writable<Combinaison[]> = writable([]);
export const DraggingItem: Writable<
	| {
			x: number;
			y: number;
			item: Item;
	  }
	| undefined
> = writable(undefined);
export const isMobile: Writable<boolean> = writable(false);
export const ShowMobileSettings: Writable<boolean> = writable(false);
