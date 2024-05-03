<script lang="ts">
	import Item from '$lib/models/Item';
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { onMount } from 'svelte';
	import ItemComponent from './ItemComponent.svelte';
	import { checkSearchFilter } from '$lib/utils';

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
	class="absolute top-0 translate-y-[-70%] bg-white outline-none md:text-xl px-4 py-2 border-y-4 border-[#534f53] border-l-4 rounded-l-xl right-0"
	placeholder="Rechercher un item..."
	bind:value={searchFilter}
/>
