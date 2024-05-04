<script lang="ts">
	import type Item from '$lib/models/Item';
	import { PlaygroundComponent } from '$lib/stores/LayoutStore';
	import { onMount } from 'svelte';
	import ItemComponent from './ItemComponent.svelte';
	import { randomNumber } from '$lib/utils';
	import { PlayerItems } from '$lib/stores/PlayerDataStore';

	let itemsOnBoard: Item[] = [];
	let SPAWNING_SPACE = 100;
	let totalDecouvert = 0;
	$: itemsDecouvertParVous = $PlayerItems.filter((x) => x.firstDiscovery).length;

	onMount(async () => {
		SPAWNING_SPACE = (document.getElementById('playground')!.clientHeight * 0.6) / 3;
		if (SPAWNING_SPACE < 80) {
			SPAWNING_SPACE = 80;
		}

		await setTotalDecouvert();
		setInterval(async () => {
			await setTotalDecouvert();
		}, 3000);
	});

	async function setTotalDecouvert() {
		totalDecouvert = await fetch('/fusionnerie/api/total-decouvert?').then((res) => res.json());
	}

	export function placeItem(item: Item, x: number = -1, y: number = -1, checkForAssociation = false) {
		// copy the item to avoid modifying the original
		item = { ...item };
		item.id = randomNumber(0, 1000000);
		item.x = x === -1 ? generateRandomX() : x;
		item.y = y === -1 ? generateRandomY() : y;
		item.checkForAssociation = checkForAssociation;

		itemsOnBoard = [...itemsOnBoard, item];
	}

	export function clear() {
		itemsOnBoard = [];
	}

	export function modifyItem(oldItem: Item, newItem: Item) {
		const index = itemsOnBoard.indexOf(oldItem);
		if (index !== -1) {
			itemsOnBoard[index] = newItem;
			itemsOnBoard[index].x = oldItem.x;
			itemsOnBoard[index].y = oldItem.y;
		}
	}

	function generateRandomX() {
		const divPlayground = document.getElementById('playground');
		if (divPlayground) {
			return randomNumber(divPlayground.clientWidth / 2 - SPAWNING_SPACE, divPlayground.clientWidth / 2 + SPAWNING_SPACE);
		}

		return 0;
	}
	function generateRandomY() {
		const divPlayground = document.getElementById('playground');
		if (divPlayground) {
			return randomNumber(divPlayground.clientHeight / 2 - SPAWNING_SPACE, divPlayground.clientHeight / 2 + SPAWNING_SPACE);
		}

		return 0;
	}
</script>

<div class="w-full h-full relative overflow-hidden" id="playground">
	{#each itemsOnBoard as item}
		<ItemComponent {item} isInPlayground x={item.x} y={item.y} checkForAssociationOnMount={item.checkForAssociation} />
	{/each}
</div>
<div class="hidden md:block">
	<p
		class="absolute select-none bg-[#d2dbdf] border-r-4 border-t-4 top-0 right-0 pr-3 pl-3 pt-1.5 md:pt-3 pb-1 md:pb-2 border-l-4 border-b-4 border-[#534f53] flex items-center gap-x-2 rounded-bl-xl md:text-base text-sm"
	>
		<span class="mono font-bold text-lg md:text-xl">{totalDecouvert.toString().padStart(6, '0')}</span> items découverts par la communauté
	</p>

	<p
		class="absolute select-none bg-[#d2dbdf] border-r-4 top-10 md:top-[3.3rem] right-0 pr-3 pl-3 pt-1.5 md:pt-3 pb-1 md:pb-2 border-l-4 border-b-4 border-[#534f53] flex items-center gap-x-2 rounded-bl-xl md:text-base text-sm"
	>
		<span class="mono font-bold text-lg md:text-xl">{itemsDecouvertParVous.toString().padStart(6, '0')}</span> item{itemsDecouvertParVous > 1
			? 's'
			: ''} découvert{itemsDecouvertParVous > 1 ? 's' : ''} par vous
	</p>
	<p
		class="absolute select-none bg-[#d2dbdf] border-r-4 top-20 md:top-[6.3rem] right-0 pr-3 pl-3 pt-1.5 md:pt-3 pb-1 md:pb-2 border-l-4 border-b-4 border-[#534f53] flex items-center gap-x-2 rounded-bl-xl md:text-base text-sm"
	>
		<span class="mono font-bold text-lg md:text-xl">{$PlayerItems.length.toString().padStart(6, '0')}</span> item{$PlayerItems.length > 1 ? 's' : ''}
		possédé{$PlayerItems.length > 1 ? 's' : ''}
	</p>
</div>
