<script lang="ts">
	import ItemsContainer from '$lib/components/ItemsContainer.svelte';
	import Playground from '$lib/components/Playground.svelte';
	import { PlaygroundComponent } from '$lib/stores/LayoutStore';
	import { onMount } from 'svelte';

	let playgroundComponent: Playground;
	onMount(() => {
		PlaygroundComponent.set(playgroundComponent);
	});
</script>

<div class="w-screen h-screen bg-[#545c77] flex items-center justify-center touch-none">
	<div class="md:w-[95%] md:h-[92%] h-[97%] flex flex-col relative shadow-2xl mt-6">
		<h1
			class="text-xl md:text-4xl absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#d2dbdf] rounded-xl px-5 py-3 border-4 border-[#534f53] shadow-2xl shadow-[#1f1f1f] select-none w-max md:mt-0 mt-2"
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
	</div>
</div>
