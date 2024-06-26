<script lang="ts">
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { onMount } from 'svelte';
	import '../app.css';
	import toast, { Toaster } from 'svelte-french-toast';
	import { ShowMobileSettings, isMobile } from '$lib/stores/LayoutStore';
	import Item from '$lib/models/Item';
	import type Combinaison from '$lib/models/Combinaison';

	let saveDataModalVisible = false;
	let loadDataModalVisible = false;
	let cheatWarningVisible = false;
	let eraseDataWarningVisible = false;

	onMount(async () => {
		// Empêche le clic droit
		window.oncontextmenu = function () {
			return false;
		};

		// Charge l'identifiant unique du joueur
		const _uniqueId = localStorage.getItem('fusionnerieUniqueId');
		if (_uniqueId) {
			uniqueId = _uniqueId;
		}

		// Vérifie si l'utilisateur est sur mobile
		isMobile.set(window.innerWidth < 768);
		window.onresize = () => {
			isMobile.set(window.innerWidth < 768);
		};

		// Charge les items du joueur sauvergardé
		loadUserDataFromLocalStorage();
	});

	async function unlockAllItems() {
		toast.promise(
			(async () => {
				// Récupère tous les items et combinaisons existants
				const response = await fetch('/fusionnerie/api/cheat');
				const data = await response.json();
				// en [0] les items et en [1] les combinaisons
				PlayerItems.set(data[0]);
				PlayerCombinaisons.set(data[1]);

				// Sauvegarde les données
				savePlayerData($PlayerItems, $PlayerCombinaisons);
			})(),
			{
				success: 'Récupération réussie !',
				error: 'Erreur lors de la récupération',
				loading: 'Récupération de tous les items déjà trouvés...'
			}
		);
	}

	let uniqueId = '';

	async function handleSaveMyDataButtonClicked() {
		if (uniqueId === '') {
			toast('Veuillez entrer un identifiant unique', {
				icon: '❌'
			});
			return;
		}

		localStorage.setItem('fusionnerieUniqueId', uniqueId);

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

		localStorage.setItem('fusionnerieUniqueId', uniqueId);

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

	/**
	 * Charge les données du joueur depuis le localStorage
	 */
	async function loadUserDataFromLocalStorage() {
		// Récupère les items et combinaisons sauvegardés
		const savedData = localStorage.getItem('playerItems');
		const savedCombinaisons = localStorage.getItem('playerCombinaisons');

		// Si il y a des données sauvegardées
		if (savedData && savedCombinaisons) {
			// Charge les items et combinaisons
			PlayerItems.set(JSON.parse(savedData));
			PlayerCombinaisons.set(JSON.parse(savedCombinaisons));

			// // Enlève toutes les combinaisons en duplication, en sachant que firstWord + secondWord = secondWord + firstWord
			// const uniqueCombinaisons = removeDuplicateCombinaisons($PlayerCombinaisons);
			// PlayerCombinaisons.set(uniqueCombinaisons);

			// // Update les emojis des items du joueurs en cas de changement de l'emoji
			// const response = await fetch('/fusionnerie/api/update-items', {
			// 	method: 'POST',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	body: savedData
			// });

			// // Récupère les items mis à jour
			// const updatedItems = await response.json();
			// PlayerItems.set(updatedItems);
			// toast('Données chargées !', {
			// 	icon: '📦',
			// 	position: 'bottom-left'
			// });
		} else {
			// Première connexion, donne au joueur les 4 items de départ
			PlayerItems.set([new Item('💧', 'Eau', false), new Item('🔥', 'Feu', false), new Item('🌍', 'Terre', false), new Item('💨', 'Air', false)]);

			savePlayerData($PlayerItems, $PlayerCombinaisons);
		}
	}

	// Fonction pour éliminer les combinaisons en duplication
	function removeDuplicateCombinaisons(combinaisons: Combinaison[]): Combinaison[] {
		const uniqueCombinaisons: Set<string> = new Set(); // Ensemble pour stocker les combinaisons uniques
		const result: Combinaison[] = [];

		// Parcourir toutes les combinaisons
		for (const combinaison of combinaisons) {
			const { firstWord, secondWord } = combinaison;

			// Vérifier si la combinaison ou sa permutation est déjà présente dans l'ensemble
			if (!uniqueCombinaisons.has(firstWord + secondWord) && !uniqueCombinaisons.has(secondWord + firstWord)) {
				// Si ce n'est pas le cas, ajouter la combinaison à l'ensemble et au résultat
				uniqueCombinaisons.add(firstWord + secondWord);
				result.push(combinaison);
			}
		}

		return result;
	}
</script>

<Toaster />
<slot />

{#if $ShowMobileSettings}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center">
		<div class="bg-[#e7edf0] w-11/12 h-80 px-3 rounded-xl flex flex-col items-center justify-center relative">
			<h2 class="text-xl">Paramètres</h2>

			<!-- Sauvegarder ses données -->
			<button class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4" on:click={() => (saveDataModalVisible = true)}>
				Sauvegarder mon progrès
			</button>

			<!-- Charger ses données -->
			<button class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4" on:click={() => (loadDataModalVisible = true)}> Charger mon progrès </button>

			<!-- Tricher -->
			<button class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4" on:click={() => (cheatWarningVisible = true)}> Tricher </button>

			<!-- Supprimer ses données -->
			<button class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4" on:click={() => (eraseDataWarningVisible = true)}>
				Supprimer mon progrès
			</button>

			<button
				on:click={() => {
					ShowMobileSettings.set(false);
				}}
				class="absolute top-0 right-0"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if eraseDataWarningVisible}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center z-50">
		<div class="bg-[#e7edf0] w-96 h-60 px-4 rounded-xl flex flex-col items-center justify-center relative">
			<h2 class="text-xl">Suppression de votre progrès</h2>
			<p class="text-center mt-5">
				Êtes-vous sûr de vouloir supprimer tout les items que vous avez découvert ? Nous vous recommendons de d'abord faire une sauvegarde.
			</p>

			<button
				class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4"
				on:click={() => {
					localStorage.removeItem('playerItems');
					localStorage.removeItem('playerCombinaisons');
					PlayerItems.set([new Item('💧', 'Eau', false), new Item('🔥', 'Feu', false), new Item('🌍', 'Terre', false), new Item('💨', 'Air', false)]);
					PlayerCombinaisons.set([]);
					eraseDataWarningVisible = false;
				}}
			>
				Oui, je veux tout supprimer
			</button>

			<button
				on:click={() => {
					eraseDataWarningVisible = false;
				}}
				class="absolute top-0 right-0"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if saveDataModalVisible}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center z-50">
		<div class="bg-[#e7edf0] w-96 px-4 h-60 rounded-xl flex flex-col items-center justify-center relative">
			<h2 class="text-xl">Sauvegarde de votre progrès</h2>

			<p class="text-center mt-3">Attention, quiconque écrivant le même identifiant pourra écraser votre progrès !</p>

			<input
				type="text"
				class="w-3/4 border-2 border-[#20423a] rounded-xl px-2 py-1 mt-4 placeholder:text-gray-500"
				placeholder="Entrez un identifiant unique"
				bind:value={uniqueId}
			/>

			<button class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4" on:click={handleSaveMyDataButtonClicked}> Sauvegarder sur le serveur </button>

			<button on:click={() => (saveDataModalVisible = false)} class="absolute top-0 right-0">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if loadDataModalVisible}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center z-50">
		<div class="bg-[#e7edf0] w-96 h-52 rounded-xl flex flex-col items-center justify-center relative">
			<h2 class="text-xl">Chargement de votre progrès</h2>

			<input
				type="text"
				class="w-3/4 border-2 border-[#20423a] rounded-xl px-2 py-1 mt-4 placeholder:text-gray-500"
				placeholder="Entrez votre identifiant unique"
				bind:value={uniqueId}
			/>

			<button class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4" on:click={handleLoadMyDataButtonClicked}> Charger depuis le serveur </button>

			<button on:click={() => (loadDataModalVisible = false)} class="absolute top-0 right-0">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if cheatWarningVisible}
	<div class="fixed top-0 left-0 w-screen h-screen bg-[#000000a3] flex items-center justify-center z-50">
		<div class="bg-[#e7edf0] w-96 h-56 px-3 rounded-xl flex flex-col items-center justify-center relative">
			<h2 class="text-xl">Attention !</h2>
			<p class="text-center">
				Êtes-vous sûr de vouloir tricher ?<br />Vous débloquerez tout les items et combinaisons déjà trouvé par d'autres joueurs.<br />Nous vous
				conseillons de sauvegarder votre progrès avant de continuer.
			</p>

			<button
				class="bg-[#20423a] text-white px-4 py-2 rounded-xl mt-4"
				on:click={() => {
					cheatWarningVisible = false;
					unlockAllItems();
				}}
			>
				Oui, je veux tricher
			</button>

			<button
				on:click={() => {
					cheatWarningVisible = false;
				}}
				class="absolute top-0 right-0"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<div class="absolute top-0 right-0 bg-[#ffffff71] px-4 py-1 rounded-bl-xl md:block hidden">
	Par <a href="https://www.rayanestaszewski.fr" target="_blank" class="text-blue-900 hover:underline">Rayane STASZEWSKI</a>
</div>

<button
	class="absolute bottom-0 right-0 bg-[#ffffff71] px-4 md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => {
		eraseDataWarningVisible = true;
	}}
>
	Supprimer mon progrès
</button>
<button
	class="absolute bottom-0 right-44 bg-[#ffffff71] px-4 md:block hidden text-sm hover:bg-[#ffffffad]"
	on:click={() => {
		toast('Cette fonctionnalité est réservée au développeur', {
			icon: '🔓'
		});
		return;
		cheatWarningVisible = true;
	}}
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
