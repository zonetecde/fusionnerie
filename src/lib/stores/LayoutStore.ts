import type Playground from '$lib/components/Playground.svelte';
import type Combinaison from '$lib/models/Combinaison';
import { writable, type Writable } from 'svelte/store';

export const PlaygroundComponent: Writable<Playground> = writable();
export const FetchingItems: Writable<number[]> = writable([]);
export const ShowCrafts: Writable<Combinaison[]> = writable([]);
