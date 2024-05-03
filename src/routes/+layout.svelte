<script lang="ts">
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { onMount } from 'svelte';
	import '../app.css';
	import toast, { Toaster } from 'svelte-french-toast';

	onMount(() => {
		window.oncontextmenu = function () {
			return false;
		};
	});

	async function unlockAllItems() {
		toast('Récupération de tout les items déjà trouvés...', {
			icon: '⌛'
		});

		// Récupère tout les items et combinaisons existants
		const response = await fetch('/fusionnerie/api/cheat');
		const data = await response.json();
		// en [0] les items et en [1] les combinaisons
		PlayerItems.set(data[0]);
		PlayerCombinaisons.set(data[1]);

		// Sauvegarde les données
		savePlayerData($PlayerItems, $PlayerCombinaisons);
	}
</script>

<Toaster />
<slot />

<div class="absolute top-0 right-0 bg-[#ffffff71] px-4 py-1 rounded-bl-xl md:block hidden">
	Par <a
		href="https://www.rayanestaszewski.fr"
		target="_blank"
		class="text-blue-900 hover:underline">Rayane STASZEWSKI</a
	>
</div>

<button
	class="absolute bottom-0 right-0 bg-[#ffffff71] px-4 md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => {
		localStorage.clear();
		location.reload();
	}}
>
	Supprimer mon progrès
</button>
<button
	class="absolute bottom-0 right-44 bg-[#ffffff71] px-4 rounded-tl-xl md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => unlockAllItems()}
>
	Tricher
</button>
