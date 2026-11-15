<script lang="ts">
	import { onMount } from 'svelte';
	import type { AppID } from '🍎/state/apps.svelte.ts';
	import { apps } from '🍎/state/apps.svelte.ts';
	import { preferences } from '🍎/state/preferences.svelte.ts';

	const { app_id }: { app_id: AppID } = $props();
	const catalogue: { id: AppID; name: string; description: string; icon: string; category: string }[] = [
		{ id: 'calculator', name: 'Calculator', description: 'Quick calculations and percentages.', icon: '🧮', category: 'Utilities' },
		{ id: 'calendar', name: 'Calendar', description: 'Keep track of dates and events.', icon: '📅', category: 'Productivity' },
		{ id: 'system-preferences', name: 'System Settings', description: 'Personalize appearance, glass and accessibility.', icon: '⚙️', category: 'System' },
		{ id: 'wallpapers', name: 'Wallpapers', description: 'Choose a desktop background.', icon: '🖼️', category: 'Personalization' },
		{ id: 'vscode', name: 'VS Code', description: 'Open the online code editor.', icon: '💻', category: 'Developer Tools' },
		{ id: 'purus-twitter', name: 'About the Developer', description: 'Learn about the original project creator.', icon: '👨‍💻', category: 'Information' },
	];
	let query = $state('');
	let category = $state('All');
	let notice = $state('');
	const categories = ['All', ...new Set(catalogue.map((app) => app.category))];
	const filtered = $derived(catalogue.filter((app) =>
		(category === 'All' || app.category === category) &&
		(app.name.toLowerCase().includes(query.toLowerCase()) || app.description.toLowerCase().includes(query.toLowerCase()))
	));
	function openApp(id: AppID) {
		apps.open[id] = true;
		apps.active = id;
		notice = `${catalogue.find((item) => item.id === id)?.name ?? 'App'} opened`;
	}
	onMount(() => { if (app_id !== 'appstore') notice = 'This app is a preview in the App Store catalogue.'; });
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle"><div><span class="store-icon">A</span><strong>App Store</strong></div></header>
	<section class="main-area">
		<div class="hero"><div><p class="eyebrow">DISCOVER</p><h1>Apps for your Mac</h1><p>Explore the apps included in this macOS Web experience.</p></div><span class="hero-symbol">✦</span></div>
		<div class="tools"><input aria-label="Search apps" placeholder="Search apps" bind:value={query} /><select aria-label="Filter category" bind:value={category}>{#each categories as item}<option>{item}</option>{/each}</select></div>
		{#if notice}<p class="notice" role="status">{notice}</p>{/if}
		<div class="app-grid">
			{#each filtered as app}
				<article class="app-card">
					<div class="app-icon">{app.icon}</div>
					<div class="app-copy"><strong>{app.name}</strong><small>{app.category}</small><p>{app.description}</p></div>
					<button onclick={() => openApp(app.id)}>{apps.open[app.id] ? 'Open' : 'Get'}</button>
				</article>
			{:else}
				<p class="empty">No apps match your search.</p>
			{/each}
		</div>
	</section>
</section>

<style>
	.container { height:100%; width:100%; display:grid; grid-template-rows:3.2rem 1fr; border-radius:inherit; overflow:hidden; background:var(--system-color-light); color:var(--system-color-light-contrast); }
	.titlebar { display:flex; align-items:center; justify-content:center; border-bottom:1px solid hsla(var(--system-color-dark-hsl),.1); }.titlebar>div { display:flex; align-items:center; gap:.5rem; font-size:.9rem; }.store-icon { display:grid; place-items:center; width:23px; height:23px; border-radius:6px; color:white; font-weight:700; background:linear-gradient(145deg,#54b8f5,#2872c9); }
	.main-area { overflow:auto; padding:1.5rem 2rem; }.hero { display:flex; align-items:center; justify-content:space-between; border-radius:14px; padding:1.5rem; color:white; background:linear-gradient(115deg,#365eaa,#8b6dc5 65%,#d58bb2); }.eyebrow { font-size:.65rem; letter-spacing:.12em; opacity:.8; margin:0 0 .4rem; }.hero h1 { font-size:1.7rem; margin:0; }.hero p:last-child { margin:.35rem 0 0; font-size:.8rem; opacity:.9; }.hero-symbol { font-size:3.5rem; opacity:.75; }.tools { display:flex; gap:.6rem; margin:1.2rem 0; }.tools input { flex:1; min-width:0; padding:.6rem .75rem; border-radius:8px; background:hsla(var(--system-color-dark-hsl),.07); color:inherit; }.tools select { padding:.5rem; border-radius:8px; background:var(--system-color-light); color:inherit; border:1px solid hsla(var(--system-color-dark-hsl),.15); }.notice { color:var(--system-color-primary); font-size:.75rem; }.app-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:.7rem; }.app-card { display:grid; grid-template-columns:48px 1fr auto; gap:.75rem; align-items:center; padding:.85rem; border:1px solid hsla(var(--system-color-dark-hsl),.12); border-radius:11px; }.app-icon { width:46px; height:46px; display:grid; place-items:center; border-radius:11px; background:hsla(var(--system-color-dark-hsl),.07); font-size:1.6rem; }.app-copy strong,.app-copy small { display:block; }.app-copy strong { font-size:.82rem; }.app-copy small { color:hsla(var(--system-color-dark-hsl),.55); font-size:.65rem; margin-top:2px; }.app-copy p { margin:.35rem 0 0; font-size:.68rem; color:hsla(var(--system-color-dark-hsl),.68); }.app-card button { border-radius:99px; padding:.38rem .8rem; background:hsla(var(--system-color-primary-hsl),.14); color:var(--system-color-primary); font-size:.72rem; font-weight:650; }.empty { grid-column:1/-1; text-align:center; padding:2rem; opacity:.6; }
</style>