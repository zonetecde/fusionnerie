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

	$: if ($DraggingItem) {
		// Check pour les mouvements de la souris
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('pointermove', handleMouseMove);
		window.addEventListener('pointerup', handleMouseUp);
	}

	let draggedItemComponent: ItemComponent;

	function handleMouseUp(e: any) {
		if ($DraggingItem !== undefined) {
			// Check pour les collisions avec le playground
			// get the div on the draggedItemComponent
			const isInPlayground = checkCollision(
				draggedItemComponent.$$.ctx[4],
				document.getElementById('playground')!
			);

			if (isInPlayground) {
				playgroundComponent.placeItem($DraggingItem.item, $DraggingItem.x, $DraggingItem.y, true);
			}

			DraggingItem.set(undefined);
		}
	}

	function handleMouseMove(e: any) {
		if ($DraggingItem) {
			$DraggingItem.x = e.clientX - 85;
			$DraggingItem.y = e.clientY - 85;
		}
	}
</script>

<div class="w-screen h-screen bg-[#545c77] flex items-center justify-center touch-none">
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
