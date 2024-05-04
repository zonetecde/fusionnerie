<script lang="ts">
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { onMount } from 'svelte';
	import '../app.css';
	import toast, { Toaster } from 'svelte-french-toast';

	let saveDataModalVisible = false;
	let loadDataModalVisible = false;

	onMount(() => {
		window.oncontextmenu = function () {
			return false;
		};

		const _uniqueId = localStorage.getItem('uniqueId');
		if (_uniqueId) {
			uniqueId = _uniqueId;
		}
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

	let uniqueId = '';

	async function handleSaveMyDataButtonClicked() {
		if (uniqueId === '') {
			toast('Veuillez entrer un identifiant unique', {
				icon: '❌'
			});
			return;
		}

		localStorage.setItem('uniqueId', uniqueId);

		const response = await fetch('/fusionnerie/api/save-user-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				uniqueId,
				playerItems: $PlayerItems,
				playerCombinaisons: $PlayerCombinaisons
			})
		});

		if ((await response.text()) === 'Succès') {
			toast(`Sauvegarde réussie sous le nom ${uniqueId} !`, {
				icon: '🎉'
			});
			saveDataModalVisible = false;
		} else {
			toast('Erreur lors de la sauvegarde', {
				icon: '❌'
			});
		}
	}

	async function handleLoadMyDataButtonClicked() {
		if (uniqueId === '') {
			toast('Veuillez entrer un identifiant unique', {
				icon: '❌'
			});
			return;
		}

		localStorage.setItem('uniqueId', uniqueId);

		toast('Chargement de votre progrès...', {
			icon: '⌛'
		});

		const response = await fetch(`/fusionnerie/api/load-user-data?uniqueId=${uniqueId}`);
		let data: any = await response.text();

		if (data === 'none') {
			toast('Aucune sauvegarde trouvée', {
				icon: '❌'
			});
		} else {
			data = JSON.parse(data);
			PlayerItems.set(JSON.parse(data.playerItems));
			PlayerCombinaisons.set(JSON.parse(data.playerCombinaisons));
			savePlayerData($PlayerItems, $PlayerCombinaisons);

			toast('Chargement réussi !', {
				icon: '🎉'
			});
			loadDataModalVisible = false;
		}
	}
</script>

<Toaster />
<slot />

{#if saveDataModalVisible}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center">
		<div
			class="bg-[#e7edf0] w-96 h-52 rounded-xl flex flex-col items-center justify-center relative"
		>
			<h2 class="text-xl">Sauvegarde de votre progrès</h2>

			<input
				type="text"
				class="w-3/4 border-2 border-[#20423a] rounded-xl px-2 py-1 mt-4 placeholder:text-gray-500"
				placeholder="Entrez un identifiant unique"
				bind:value={uniqueId}
			/>

			<button
				class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4"
				on:click={handleSaveMyDataButtonClicked}
			>
				Sauvegarder sur le serveur
			</button>

			<button on:click={() => (saveDataModalVisible = false)} class="absolute top-0 right-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if loadDataModalVisible}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center">
		<div
			class="bg-[#e7edf0] w-96 h-52 rounded-xl flex flex-col items-center justify-center relative"
		>
			<h2 class="text-xl">Chargement de votre progrès</h2>

			<input
				type="text"
				class="w-3/4 border-2 border-[#20423a] rounded-xl px-2 py-1 mt-4 placeholder:text-gray-500"
				placeholder="Entrez votre identifiant unique"
				bind:value={uniqueId}
			/>

			<button
				class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4"
				on:click={handleLoadMyDataButtonClicked}
			>
				Charger depuis le serveur
			</button>

			<button on:click={() => (loadDataModalVisible = false)} class="absolute top-0 right-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}

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
	class="absolute bottom-0 right-44 bg-[#ffffff71] px-4 md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => unlockAllItems()}
>
	Tricher
</button>
<button
	class="absolute bottom-0 right-[15.7rem] bg-[#ffffff71] px-4 md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => (saveDataModalVisible = true)}
>
	Sauvegarder mon progrès
</button>
<button
	class="absolute bottom-0 right-[27.55rem] bg-[#ffffff71] px-4 rounded-tl-xl md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => (loadDataModalVisible = true)}
>
	Charger mon progrès
</button>
