<script lang="ts">
	import type Item from '$lib/models/Item';
	import { PlaygroundComponent } from '$lib/stores/LayoutStore';
	import { onMount } from 'svelte';
	import ItemComponent from './ItemComponent.svelte';
	import { checkSearchFilter, randomNumber } from '$lib/utils';
	import { PlayerItems } from '$lib/stores/PlayerDataStore';
	import Background from './Background.svelte';

	let itemsOnBoard: Item[] = [];
	let SPAWNING_SPACE = 100;
	let totalDecouvert = 0;
	$: itemsDecouvertParVous = $PlayerItems.filter((x) => x.firstDiscovery).length;

	let showSearchMenu = false;
	let searchMenuPosition = { x: 0, y: 0 };
	let searchFilter = '';

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

	export function placeItem(item: Item, x: number = -1, y: number = -1, checkForAssociation = false, drag = false) {
		// copy the item to avoid modifying the original
		item = { ...item };
		item.id = randomNumber(0, 1000000);
		item.x = x === -1 ? generateRandomX() : x;
		item.y = y === -1 ? generateRandomY() : y;
		item.checkForAssociation = checkForAssociation;
		item.drag = drag;

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

	function handleDoubleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		// Ouvre le menu de recherche d'item rapide si c'est un clique directement sur le playground
		if (event.target === event.currentTarget) {
			showSearchMenu = true;
			searchMenuPosition = { x: event.offsetX, y: event.offsetY };
			// Sélectionne tout le texte dans l'input
			setTimeout(() => {
				(document.getElementById('input-search') as HTMLInputElement)?.select();
			}, 0);
		} else {
			// Récupère l'id de l'item cliqué
			const id: string = (event.target as HTMLElement)?.parentElement?.id || '';
			if (id.includes('itemcomp')) {
				// Récupère l'item cliqué
				const clickedItemId = id.split('_')[0];

				// Le duplique à l'endroit du clique
				const clickedItem = itemsOnBoard.find((x) => x.id.toString() === clickedItemId);
				if (clickedItem) {
					// Récupère la position du clique sur le playground

					placeItem(clickedItem, clickedItem.x, clickedItem.y, false, true);
				}
			}
		}
	}
</script>

<Background />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="w-full h-full relative overflow-hidden" id="playground" on:dblclick={handleDoubleClick} on:click={() => (showSearchMenu = false)}>
	{#each itemsOnBoard as item}
		<ItemComponent {item} isInPlayground x={item.x} y={item.y} checkForAssociationOnMount={item.checkForAssociation} isBeingDragged={item.drag} />
	{/each}
</div>

{#if showSearchMenu}
	<div
		class="absolute z-40 w-52 h-92 bg-white select-none border-2 border-slate-600 shadow-2xl shadow-[#5a5656] rounded-xl p-1"
		style="left: {searchMenuPosition.x}px; top: {searchMenuPosition.y}px;"
	>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			autocomplete="off"
			id="input-search"
			type="text"
			class="w-full h-8 border border-gray-300 rounded-md outline-none p-2 accent-slate-400"
			placeholder="Rechercher un item..."
			bind:value={searchFilter}
			autofocus
		/>

		<div class="flex flex-col gap-y-1 mt-1 overflow-y-auto h-80">
			{#each $PlayerItems as item}
				{#if searchFilter === '' || checkSearchFilter(searchFilter, item.name)}
					<button
						class="flex hover:bg-slate-300 items-center gap-x-2 p-2 border border-gray-300 rounded-md text-left"
						on:click={() => {
							showSearchMenu = false;
							placeItem(item, searchMenuPosition.x, searchMenuPosition.y, true);
						}}
					>
						<span>{item.emoji} {item.name}</span>
					</button>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<div class="hidden md:block">
	<p
		class="absolute select-none rounded-tr-xl bg-[#d2dbdf] border-r-4 border-t-4 top-0 right-0 pr-3 pl-3 pt-1.5 md:pt-3 pb-1 md:pb-2 border-l-4 border-b-4 border-[#534f53] flex items-center gap-x-2 rounded-bl-xl md:text-base text-sm"
	>
		<span class="mono font-bold text-lg md:text-xl">{totalDecouvert.toString().padStart(6, '0')}</span> items découverts par la communauté
	</p>

	<p
		class="absolute select-none bg-[#d2dbdf] border-r-4 top-10 md:top-[3.25rem] right-0 pr-3 pl-3 pt-1.5 md:pt-3 pb-1 md:pb-2 border-l-4 border-b-4 border-[#534f53] flex items-center gap-x-2 rounded-bl-xl md:text-base text-sm"
	>
		<span class="mono font-bold text-lg md:text-xl">{itemsDecouvertParVous.toString().padStart(6, '0')}</span> item{itemsDecouvertParVous > 1
			? 's'
			: ''} découvert{itemsDecouvertParVous > 1 ? 's' : ''} par vous
	</p>
	<p
		class="absolute select-none bg-[#d2dbdf] border-r-4 top-20 md:top-[6.25rem] right-0 pr-3 pl-3 pt-1.5 md:pt-3 pb-1 md:pb-2 border-l-4 border-b-4 border-[#534f53] flex items-center gap-x-2 rounded-bl-xl md:text-base text-sm"
	>
		<span class="mono font-bold text-lg md:text-xl">{$PlayerItems.length.toString().padStart(6, '0')}</span> item{$PlayerItems.length > 1 ? 's' : ''}
		possédé{$PlayerItems.length > 1 ? 's' : ''}
	</p>
</div>

<style>
	::selection {
		background-color: #6fafda;
		color: #000000;
	}
</style>
