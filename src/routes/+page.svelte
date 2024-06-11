<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';

	let actx: AudioContext | null = null;
	onMount(() => {
		actx = new AudioContext();
	});

	onDestroy(() => {
		actx?.close();
	});

	let source = '';
	async function upload(e: Event & { currentTarget: HTMLInputElement }) {
		const file = e.currentTarget.files?.[0];
		if (!file) {
			return;
		}

		const url = URL.createObjectURL(file);
		source = url;
	}

	let bpm = 0;
	let taps: number[] = [];
	let bpmMin = 0;
	let bpmMax = 0;
	let pressed = false;
	let reset = 0;
	function tap() {
		pressed = true;
		clearTimeout(reset);
		reset = setTimeout(() => {
			pressed = false;
		}, 100);

		taps.push(Date.now());
		while (taps.length > 0 && taps[0] < Date.now() - 5_000) {
			taps.shift();
		}
		if (taps.length > 2) {
			const diffs = taps.slice(1).map((tap, i) => tap - taps[i]);
			const duration = taps[taps.length - 1] - taps[0];
			const count = taps.length - 1;

			const avg = duration / count;
			const min = Math.min(...diffs);
			const max = Math.max(...diffs);
			bpm = Math.round(60_000 / avg);
			bpmMin = Math.round(60_000 / max);
			bpmMax = Math.round(60_000 / min);
		}

		if (actx) {
			const osc = actx.createOscillator();
			osc.frequency.value = 300;
			osc.connect(actx.destination);
			osc.start();
			osc.stop(actx.currentTime + 0.05);
			setTimeout(() => {
				osc.disconnect();
			}, 50);
		}
	}
</script>

<svelte:head>
	<title>BPM Counter</title>
	<meta name="description" content="Calculate BPM from audio file and tap tempo." />
</svelte:head>

<svelte:document on:keydown={tap} on:click={tap} />

<div
	class="w-full h-full p-4 flex flex-col justify-center items-center gap-4 transition-all bg-base-300"
	class:bg-base-100={pressed}
>
	<div>
		{#if source}
			<audio
				src={source}
				controls
				autoplay
				on:focus={(e) => e.currentTarget.blur()}
				on:click={(e) => e.stopPropagation()}
			>
				Your browser does not support the audio element.
			</audio>
		{:else}
			<label>
				<div class="btn btn-bordered btn-primary">
					<input class="hidden" type="file" accept="audio/*" on:change={upload} />
					<span class="label">Select Audio File</span>
				</div>
			</label>
		{/if}
	</div>
	{#if source}
		<div>
			<h1 class="text-5xl font-bold text-secondary text-center">{bpm}</h1>
			<p class="text-sm text-center">
				{bpmMin} - {bpmMax}
			</p>
		</div>
		<div>Tap on the page or press any key to calculate BPM.</div>
	{/if}
</div>
