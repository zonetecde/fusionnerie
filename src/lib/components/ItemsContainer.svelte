<script lang="ts">
	import Item from '$lib/models/Item';
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { onMount } from 'svelte';
	import ItemComponent from './ItemComponent.svelte';
	import { checkSearchFilter } from '$lib/utils';
	import { PlaygroundComponent } from '$lib/stores/LayoutStore';

	let searchFilter = '';

	onMount(() => {
		// Charge les items du joueur sauvergardé
		const savedData = localStorage.getItem('playerItems');
		if (savedData) {
			PlayerItems.set(JSON.parse(savedData));
		} else {
			// Première connexion, donne au joueur les 4 items de départ
			PlayerItems.set([
				new Item('💧', 'Eau', false),
				new Item('🔥', 'Feu', false),
				new Item('🌍', 'Terre', false),
				new Item('💨', 'Air', false)
			]);

			savePlayerData($PlayerItems, $PlayerCombinaisons);
		}
	});
</script>

<section
	class="w-full h-full flex-wrap flex-row flex px-4 py-6 gap-x-4 overflow-y-scroll gap-y-3 relative"
>
	{#each $PlayerItems as item}
		{#if searchFilter === '' || checkSearchFilter(searchFilter, item.name)}
			<ItemComponent {item} />
		{/if}
	{/each}
</section>

<!-- Barre de recherche -->
<input
	type="text"
	class="absolute top-0 translate-y-[-70%] bg-[#e7edf0] outline-none md:text-lg pl-4 duration-150 hover:bg-[#afcbda] hover:placeholder:text-gray-500 md:w-[300px] py-2 border-y-4 border-[#534f53] border-l-4 rounded-l-xl right-0"
	placeholder="Rechercher un item..."
	bind:value={searchFilter}
/>

<!-- Icone -->
<button
	class="absolute -translate-y-1/2 -top-2.5 right-[230px] md:right-[320px] duration-150 hover:bg-[#afcbda] bg-[#e7edf0] border-4 border-[#534f53] rounded-2xl w-12 h-12 p-1"
	on:click={() => $PlaygroundComponent.clear()}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class=""
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
		/>
	</svg>
</button>
