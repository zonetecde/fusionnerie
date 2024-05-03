<script lang="ts">
	import type Item from '$lib/models/Item';
	import { FetchingItems, PlaygroundComponent } from '$lib/stores/LayoutStore';
	import { PlayerCombinaisons, PlayerItems, savePlayerData } from '$lib/stores/PlayerDataStore';
	import { checkCollision } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';

	export let item: Item;

	export let isInPlayground: boolean = false;
	export let x: number = 0;
	export let y: number = 0;

	let isBeingDragged = false;
	let thisComponent: HTMLButtonElement;

	function placeOnPlayground() {
		if (!isInPlayground) $PlaygroundComponent.placeItem(item);
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('pointermove', handleMouseMove);
		window.addEventListener('pointerup', handleMouseUp);
	});

	onDestroy(() => {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('pointermove', handleMouseMove);
		window.removeEventListener('pointerup', handleMouseUp);
	});

	function handleMouseUp(e: any) {
		checkForAssociation();
		isBeingDragged = false;
	}

	function handleMouseDown() {
		if (isInPlayground) {
			isBeingDragged = true;
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (isBeingDragged) {
			// Prend la position de la sourie par rapport à la div playground
			const divPlayground = document.getElementById('playground');
			if (divPlayground) {
				const rect = divPlayground.getBoundingClientRect();
				x = event.clientX - rect.left - 25;
				y = event.clientY - rect.top - 25;
			}
		}
	}

	async function checkForAssociation() {
		if (!isBeingDragged) return;

		// Regarde si après le drag l'item collide avec un élément
		const divPlayground = document.getElementById('playground');
		if (divPlayground) {
			for (var i = 0; i < divPlayground.children.length; i++) {
				const itemButton = divPlayground.children[i];
				if (itemButton.id.includes('itemcomp_')) {
					const itemName = itemButton.id.split('itemcomp_')[1];
					const itemId = itemButton.id.split('itemcomp_')[0];

					if (itemButton !== thisComponent) {
						// Check collision
						if (checkCollision(itemButton, thisComponent)) {
							// Association entre item.name et itemName
							FetchingItems.set([...$FetchingItems, item.id, parseInt(itemId)]);
							const combinedItem = await handleDoAssociation(item.name, itemName);
							FetchingItems.set(
								$FetchingItems.filter((x) => x !== item.id && x !== parseInt(itemId))
							);

							// Si la combinaison a réussi
							if (combinedItem !== undefined) {
								// Enlève itemButton et remplace ce component par le nouvelle item
								itemButton.remove();
								$PlaygroundComponent.modifyItem(item, combinedItem);
							}
							savePlayerData($PlayerItems, $PlayerCombinaisons);
							break;
						}
					}
				}
			}
		}
	}

	async function handleDoAssociation(firstWord: string, secondWord: string) {
		// Requête au back-end
		const response = await fetch(
			`/fusionnerie/api/get-association?firstWord=${firstWord}&secondWord=${secondWord}`
		);

		const newItemJson = await response.text();

		if (newItemJson === 'none') {
			// Pas de combinaison
			return undefined;
		}

		const combinedItem = JSON.parse(newItemJson) as Item;

		// Regarde si l'item a déjà été découvert par l'utilisateur
		if (!$PlayerItems.some((x) => x.name === combinedItem.name)) {
			PlayerItems.set([...$PlayerItems, combinedItem]);
			PlayerCombinaisons.set([
				...$PlayerCombinaisons,
				{ firstWord: firstWord, secondWord: secondWord, result: combinedItem.name }
			]);
		}

		// Retounr l'item
		return combinedItem;
	}
</script>

<button
	class={'relative border-2 border-[#717e79] shadow-lg shadow-[#2a2f44] bg-[#d6ecf3] md:text-xl rounded-lg px-3 h-fit py-1 hover:scale-110 duration-150 select-none outline-none w-max ' +
		(item.firstDiscovery && isInPlayground === false ? ' rounded-br-none mb-3 ' : '') +
		($FetchingItems.includes(item.id) && isInPlayground === true
			? ' bg-slate-600 shadow-none border-[#2f3834] scale-75 hover:scale-75 '
			: '')}
	style={isInPlayground ? `position: absolute; left: ${x}px; top: ${y}px` : ''}
	id={item.id + '_itemcomp_' + item.name}
	on:click={placeOnPlayground}
	on:mousedown={handleMouseDown}
	on:pointerdown={handleMouseDown}
	on:pointerup={handleMouseUp}
	bind:this={thisComponent}
>
	<span>
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
				><circle
					stroke-dasharray="164.93361431346415 56.97787143782138"
					r="35"
					stroke-width="10"
					stroke="#00a98f"
					fill="none"
					cy="50"
					cx="50"
				>
					<animateTransform
						keyTimes="0;1"
						values="0 50 50;360 50 50"
						dur="1s"
						repeatCount="indefinite"
						type="rotate"
						attributeName="transform"
					></animateTransform>
				</circle><g></g></g
			></svg
		>{/if}
</button>
