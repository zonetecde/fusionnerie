<script lang="ts">
	import type Item from '$lib/models/Item';
	import { DraggingItem, FetchingItems, PlaygroundComponent, ShowCrafts, isMobile } from '$lib/stores/LayoutStore';
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { checkCollision, playAudio, randomNumber } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';

	export let item: Item;

	export let isInPlayground: boolean = false;
	export let x: number = 0;
	export let y: number = 0;
	export let checkForAssociationOnMount: boolean = false; // A la fin du drag

	// Attention ! A chaque fois qu'on ajoute une variable ici, il faut changer l'index dans le .ctx (+page.svelte)
	let isNewItem = false;
	export let isBeingDragged = false;
	let thisComponent: HTMLButtonElement;

	export function getReference() {
		return thisComponent;
	}

	/**
	 * Place l'item actuelle sur le playground
	 * Est appelé lorsque l'utilisateur clique sur l'item seulement
	 */
	let didPlaceOnPlayground = false; // Empêche de placer l'item plusieurs fois
	function placeOnPlayground() {
		// Si l'item est dans le conteneur à item et que on l'a pas déjà placé il y amoins de 140ms (pour éviter certains bugs)
		if (!isInPlayground && !didPlaceOnPlayground) {
			// Place l'item sur le playground
			$PlaygroundComponent.placeItem(item);

			// Empêche de placer l'item plusieurs fois
			didPlaceOnPlayground = true;
			setTimeout(() => {
				didPlaceOnPlayground = false;
			}, 140);
		}
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('pointermove', handleMouseMove);
		window.addEventListener('pointerup', handleMouseUp);

		if (checkForAssociationOnMount) {
			isBeingDragged = true;
			checkForAssociation();
		}

		// Si dès son placement on est en train de le drag (double clique sur l'item dans le playground pour duplication)
		// alors on enlève le drag après 100ms pour éviter de le déplacer une seconde fois
		if (isBeingDragged) {
			setTimeout(() => {
				item.drag = false;
			}, 100);
		}
	});

	onDestroy(() => {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('pointermove', handleMouseMove);
		window.removeEventListener('pointerup', handleMouseUp);
	});

	/**
	 * Gère la fin du drag de l'item
	 */
	let isMouseUp = false; // Empêche le drag si le clique est relaché (= clique court)
	function handleMouseUp(e: any) {
		if (isInPlayground && isBeingDragged) {
			// Si l'item est dans le playground
			// On vérifie si l'item est en collision avec un autre item
			checkForAssociation();
			isBeingDragged = false;

			playAudio(`/fusionnerie/audio/click${randomNumber(1, 3)}.mp3`);
		} else {
			// Si l'item est dans le conteneur à item, on prévient que le clique est relaché (pour éviter le drag)
			isMouseUp = true;
			setTimeout(() => {
				isMouseUp = false;
			}, 200);
		}
	}

	/**
	 * Gère le début du drag de l'item
	 */
	function handleMouseDown(e: any) {
		// Si le clique gauche est appuyé
		if (e.button === 0) {
			// Si il est dans le playground - simple drag dedans
			if (isInPlayground) {
				isBeingDragged = true;
				playAudio(`/fusionnerie/audio/click${randomNumber(1, 3)}.mp3`, 0.5);
			} else {
				// Sinon, on attend 100ms pour voir si le clique est relaché
				setTimeout(() => {
					// Si le clique est toujours appuyé et que l'utilisateur n'est pas sur mobile (pour éviter le drag sur mobile)
					if (!isMouseUp && !$isMobile)
						// On commence le drag qui va être géré dans page.svelte
						DraggingItem.set({
							item: item,
							x: e.clientX - 85,
							y: e.clientY - 85
						});
					else {
						// Sinon c'est qu'un simple clique - place l'item sur le playground
						placeOnPlayground();
					}

					playAudio(`/fusionnerie/audio/drag${randomNumber(1, 3)}.mp3`, 0.5);
				}, 100);
			}
		}
		// Si clique droit
		if (e.button === 2) {
			// Affiche les crafts possibles
			ShowCrafts.set($PlayerCombinaisons.filter((x) => x.result === item.name));
		}
	}

	/**
	 * Gère le drag de l'item dans le playground
	 */
	function handleMouseMove(event: MouseEvent) {
		if (isBeingDragged && isInPlayground) {
			// Prend la position de la souris par rapport à la div playground
			const divPlayground = document.getElementById('playground');
			if (divPlayground) {
				// Bouge l'item à la position de la souris
				const rect = divPlayground.getBoundingClientRect();
				x = event.clientX - rect.left - 25;
				y = event.clientY - rect.top - 25;
				item.x = x;
				item.y = y;
			}
		}
	}

	/**
	 * Vérifie si l'item est en collision avec un autre item
	 */
	async function checkForAssociation() {
		// Si l'item n'est pas en drag, on ne fait rien
		if (!isBeingDragged) return;

		// Regarde si après le drag l'item collide avec un élément
		const divPlayground = document.getElementById('playground');
		if (divPlayground) {
			// Pour chaque item dans le playground
			for (var i = 0; i < divPlayground.children.length; i++) {
				const colliderItemButton = divPlayground.children[i];
				if (colliderItemButton.id.includes('itemcomp_')) {
					// Récupère le nom de l'item et son id
					const colliderItemName = colliderItemButton.id.split('itemcomp_')[1];
					const colliderItemId = colliderItemButton.id.split('itemcomp_')[0];

					// Si l'item n'est pas lui même
					if (colliderItemButton !== thisComponent) {
						// Check collision entre ce component et l'item
						if (checkCollision(colliderItemButton, thisComponent)) {
							// On est en collision
							// Association entre item.name et itemName
							// Prévient que ces deux items sont en train d'être combinés (animation)
							FetchingItems.set([...$FetchingItems, item.id, parseInt(colliderItemId)]);

							// Fait l'association
							const combinedItem = await handleDoAssociation(item.name, colliderItemName);

							// Enlève les items de la liste des items en train d'être combinés (arrête l'animation)
							FetchingItems.set($FetchingItems.filter((x) => x !== item.id && x !== parseInt(colliderItemId)));

							// Si la combinaison a réussi
							if (combinedItem !== undefined) {
								// Si l'item combiné est le même que l'item actuel ou l'item avec lequel il y a eu collision
								if (combinedItem.name === item.name || combinedItem.name === colliderItemName) {
									// Audio d'erreur
									console.log('Erreur de combinaison');
									playAudio(`/fusionnerie/audio/error.mp3`, 0.5);
									return;
								}

								// Enlève l'item avec lequel il y a eu collision et remplace ce component par le nouvelle item
								colliderItemButton.remove();
								$PlaygroundComponent.modifyItem(item, combinedItem);
								playAudio(`/fusionnerie/audio/combine1.mp3`, 0.5);

								// Si c'est un nouvel item
								if (combinedItem.firstDiscovery) {
									isNewItem = true;

									setTimeout(() => {
										isNewItem = false;
									}, 1000);
								}
							}

							// Sauvegarde les données
							savePlayerData($PlayerItems, $PlayerCombinaisons);
							break;
						}
					}
				}
			}
		}
	}

	/**
	 * Fait l'association entre deux items
	 */
	async function handleDoAssociation(firstWord: string, secondWord: string) {
		// Requête au back-end
		const response = await fetch(`/fusionnerie/api/get-association?firstWord=${firstWord}&secondWord=${secondWord}`);

		const newItemJson = await response.text();

		// Si la combinaison n'a pas fonctionné (erreur ou autre)
		if (newItemJson === 'none') {
			// Pas de combinaison
			return undefined;
		}

		// Sinon, on a un nouvel item
		const combinedItem = JSON.parse(newItemJson) as Item;

		// Regarde si l'item a déjà été découvert par l'utilisateur
		if (!$PlayerItems.some((x) => x.name === combinedItem.name)) {
			// Si non, on l'ajoute
			PlayerItems.set([combinedItem, ...$PlayerItems]);
		}

		// On ajoute la combinaison à la liste des combinaisons si elle n'existe pas déjà
		const combinationExists = $PlayerCombinaisons.some(
			(combination) =>
				(combination.firstWord === firstWord && combination.secondWord === secondWord && combination.result === combinedItem.name) ||
				(combination.firstWord === secondWord && combination.secondWord === firstWord && combination.result === combinedItem.name)
		);

		if (!combinationExists) {
			PlayerCombinaisons.set([{ firstWord: firstWord, secondWord: secondWord, result: combinedItem.name }, ...$PlayerCombinaisons]);
		}

		// Retourne le nouvel item
		return combinedItem;
	}
</script>

{#if isInPlayground && isNewItem}
	<img
		src="/fusionnerie/confetti.gif"
		alt="confetti"
		class="absolute w-48 -translate-x-5 -translate-y-16"
		style={'left: ' + x + 'px; top: ' + y + 'px;'}
	/>
{/if}

<button
	class={'relative border-2 border-[#717e79] shadow-lg shadow-[#2a2f44] bg-[#d6ecf3] md:text-xl rounded-lg px-3 h-fit py-1 hover:scale-110 duration-150 select-none outline-none w-max ' +
		(item.firstDiscovery && isInPlayground === false ? ' rounded-br-none mb-3 ' : '') +
		($FetchingItems.includes(item.id) && isInPlayground === true ? ' bg-slate-600 shadow-none border-[#2f3834] scale-75 hover:scale-75 ' : '')}
	style={isInPlayground ? `position: absolute; left: ${x}px; top: ${y}px` : ''}
	id={$FetchingItems.includes(item.id) ? '' : item.id + '_itemcomp_' + item.name}
	on:click={placeOnPlayground}
	on:mousedown={handleMouseDown}
	on:pointerdown={handleMouseDown}
	on:pointerup={handleMouseUp}
	bind:this={thisComponent}
>
	<span class="w-full h-full">
		{item.emoji}
		{item.name}
	</span>

	{#if item.firstDiscovery && isInPlayground === false}
		<p
			class="absolute text-xs md:text-sm bg-[#d6ecf3] md:right-[-0.15rem] right-[-0.12rem] bottom-[-1.25rem] md:bottom-[-1.50rem] px-1 rounded-b-lg border-x-2 border-b-2 border-[#717e79] pb-0.5"
		>
			✨Inédit
		</p>
	{/if}

	{#if $FetchingItems.includes(item.id) && isInPlayground === true}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			preserveAspectRatio="xMidYMid"
			width="30"
			height="30"
			class="absolute left-1/2 -translate-x-1/2 top-0.5"
			style="shape-rendering: auto; display: block; background: transparent;"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			><g
				><circle stroke-dasharray="164.93361431346415 56.97787143782138" r="35" stroke-width="10" stroke="#00a98f" fill="none" cy="50" cx="50">
					<animateTransform keyTimes="0;1" values="0 50 50;360 50 50" dur="1s" repeatCount="indefinite" type="rotate" attributeName="transform"
					></animateTransform>
				</circle><g></g></g
			></svg
		>{/if}
</button>
