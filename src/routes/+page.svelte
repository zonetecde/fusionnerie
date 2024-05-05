<script lang="ts">
	import ItemComponent from '$lib/components/ItemComponent.svelte';
	import ItemsContainer from '$lib/components/ItemsContainer.svelte';
	import Playground from '$lib/components/Playground.svelte';
	import { DraggingItem, PlaygroundComponent } from '$lib/stores/LayoutStore';
	import { checkCollision } from '$lib/utils';
	import { onMount } from 'svelte';

	let playgroundComponent: Playground;
	onMount(() => {
		PlaygroundComponent.set(playgroundComponent);
	});

	// Si un item est en train d'être draggé/a été posé
	$: if ($DraggingItem) {
		// Load les event listeners
		if ($DraggingItem !== undefined) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
			window.addEventListener('pointermove', handleMouseMove);
			window.addEventListener('pointerup', handleMouseUp);
		} else {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('pointermove', handleMouseMove);
			window.removeEventListener('pointerup', handleMouseUp);
		}
	}

	// L'item en train d'être draggé
	let draggedItemComponent: ItemComponent;

	function handleMouseUp(e: any) {
		if ($DraggingItem !== undefined) {
			// Regarde si l'item est dans le playground
			if (checkCollision(draggedItemComponent.getReference(), document.getElementById('playground')!)) {
				// Place l'item sur le playground à la position du curseur
				playgroundComponent.placeItem($DraggingItem.item, $DraggingItem.x, $DraggingItem.y, true);
			}

			// Plus de dragging
			DraggingItem.set(undefined);
		}
	}

	/**
	 * Déplace l'item en train d'être draggé
	 */
	function handleMouseMove(e: any) {
		if ($DraggingItem) {
			$DraggingItem.x = e.clientX - 85;
			$DraggingItem.y = e.clientY - 85;
		}
	}
</script>

<div class="w-screen h-screen bg-[#545c77] flex items-center justify-center touch-none overflow-hidden">
	<div class="md:w-[95%] md:h-[92%] h-[97%] flex flex-col relative shadow-2xl mt-6">
		<h1
			class="text-xl md:text-4xl absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#d2dbdf] rounded-xl px-5 py-3 border-4 border-[#534f53] shadow-2xl shadow-[#1f1f1f] select-none w-max md:mt-0 mt-2 z-40"
		>
			🛠️ Fusionnerie
		</h1>

		<!-- Playground -->
		<section class="w-full h-4/6 bg-[#e7edf0] rounded-t-2xl border-t-4 border-x-4 border-[#534f53]">
			<Playground bind:this={playgroundComponent} />
		</section>

		<!-- Items -->
		<section class="w-full h-2/6 bg-[#e7edf0] border-4 rounded-b-xl border-[#534f53] relative">
			<ItemsContainer />
		</section>

		<!-- Place l'item en train d'être dragger sur l'écran -->
		{#if $DraggingItem}
			<ItemComponent
				bind:this={draggedItemComponent}
				item={$DraggingItem.item}
				isInPlayground={true}
				bind:x={$DraggingItem.x}
				bind:y={$DraggingItem.y}
			/>
		{/if}
	</div>
</div>
