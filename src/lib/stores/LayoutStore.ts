import type Playground from '$lib/components/Playground.svelte';
import { writable, type Writable } from 'svelte/store';

export const PlaygroundComponent: Writable<Playground> = writable();
export const FetchingItems: Writable<number[]> = writable([]);
