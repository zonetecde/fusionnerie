<script lang="ts">
	import type Item from '$lib/models/Item';
	import { PlaygroundComponent } from '$lib/stores/LayoutStore';
	import { onMount } from 'svelte';
	import ItemComponent from './ItemComponent.svelte';
	import { randomNumber } from '$lib/utils';

	let itemsOnBoard: Item[] = [];
	let SPAWNING_SPACE = 100;

	onMount(() => {
		SPAWNING_SPACE = (document.getElementById('playground')!.clientHeight * 0.6) / 3;
		if (SPAWNING_SPACE < 80) {
			SPAWNING_SPACE = 80;
		}

		console.log('SPAWNING_SPACE', SPAWNING_SPACE);
	});

	export function placeItem(item: Item) {
		// copy the item to avoid modifying the original
		item = { ...item };
		item.id = randomNumber(0, 1000000);
		itemsOnBoard = [...itemsOnBoard, item];
	}

	export function clear() {
		itemsOnBoard = [];
	}

	export function modifyItem(oldItem: Item, newItem: Item) {
		const index = itemsOnBoard.indexOf(oldItem);
		if (index !== -1) {
			itemsOnBoard[index] = newItem;
		}
	}

	function generateRandomX() {
		const divPlayground = document.getElementById('playground');
		if (divPlayground) {
			return randomNumber(
				divPlayground.clientWidth / 2 - SPAWNING_SPACE,
				divPlayground.clientWidth / 2 + SPAWNING_SPACE
			);
		}

		return 0;
	}
	function generateRandomY() {
		const divPlayground = document.getElementById('playground');
		if (divPlayground) {
			return randomNumber(
				divPlayground.clientHeight / 2 - SPAWNING_SPACE,
				divPlayground.clientHeight / 2 + SPAWNING_SPACE
			);
		}

		return 0;
	}
</script>

<div class="w-full h-full relative overflow-hidden" id="playground">
	{#each itemsOnBoard as item}
		<ItemComponent {item} isInPlayground x={generateRandomX()} y={generateRandomY()} />
	{/each}
</div>
