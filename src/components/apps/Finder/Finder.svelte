<script lang="ts">
	import { onMount } from 'svelte';
	type Entry = { id: number; name: string; kind: 'folder' | 'file'; location: string; modified: string };
	const locations = ['Recents', 'Applications', 'Desktop', 'Documents', 'Downloads', 'Pictures'];
	let location = $state('Recents');
	let entries = $state<Entry[]>([]);
	let search = $state('');
	let new_folder = $state('');
	let creating = $state(false);
	let selected = $state<number | null>(null);
	let notice = $state('');
	const seed: Entry[] = [
		{ id: 1, name: 'Applications', kind: 'folder', location: 'Computer', modified: 'Today' },
		{ id: 2, name: 'Desktop', kind: 'folder', location: 'Computer', modified: 'Today' },
		{ id: 3, name: 'Documents', kind: 'folder', location: 'Computer', modified: 'Today' },
		{ id: 4, name: 'Downloads', kind: 'folder', location: 'Computer', modified: 'Today' },
		{ id: 5, name: 'Pictures', kind: 'folder', location: 'Computer', modified: 'Today' },
		{ id: 6, name: 'Welcome.txt', kind: 'file', location: 'Documents', modified: 'Today' },
		{ id: 7, name: 'Project Notes.txt', kind: 'file', location: 'Documents', modified: 'Yesterday' },
		{ id: 8, name: 'macOS Web', kind: 'folder', location: 'Applications', modified: 'Today' },
		{ id: 9, name: 'Wallpaper Collection', kind: 'folder', location: 'Pictures', modified: 'Yesterday' },
	];
	onMount(() => {
		try { entries = JSON.parse(localStorage.getItem('macos-web-finder-items') || 'null') || seed; }
		catch { entries = seed; }
	});
	const visible = $derived(entries.filter((entry) =>
		(entry.location === location || (location === 'Recents' && entry.kind === 'file')) &&
		entry.name.toLowerCase().includes(search.toLowerCase())
	));
	function persist() { localStorage.setItem('macos-web-finder-items', JSON.stringify(entries)); }
	function createFolder(event: SubmitEvent) {
		event.preventDefault();
		const name = new_folder.trim();
		if (!name) return;
		if (entries.some((entry) => entry.location === location && entry.name.toLowerCase() === name.toLowerCase())) {
			notice = 'A folder with that name already exists.'; return;
		}
		entries = [...entries, { id: Date.now(), name, kind: 'folder', location, modified: 'Just now' }];
		persist(); new_folder = ''; creating = false; notice = 'Folder created.';
	}
	function openEntry(entry: Entry) {
		if (entry.kind === 'folder' && locations.includes(entry.name)) { location = entry.name; selected = null; search = ''; }
		else { selected = entry.id; notice = entry.kind === 'file' ? `Preview: ${entry.name}` : `Selected folder: ${entry.name}`; }
	}
	function removeSelected() {
		if (selected === null) return;
		entries = entries.filter((entry) => entry.id !== selected);
		persist(); selected = null; notice = 'Item moved to Trash (in this demo).';
	}
</script>

<section class="finder">
	<header class="toolbar app-window-drag-handle">
		<div class="nav-buttons"><button aria-label="Back" onclick={() => (location = 'Recents')}>‹</button><button aria-label="Forward" disabled>›</button></div>
		<strong>{location}</strong>
		<div class="toolbar-actions"><button onclick={() => (creating = !creating)}>New Folder</button><button onclick={removeSelected} disabled={selected === null}>Delete</button></div>
	</header>
	<div class="body">
		<aside class="sidebar">
			<p>Favorites</p>
			{#each locations as item}
				<button class:active={location === item} onclick={() => { location = item; selected = null; }}>{item === 'Recents' ? '◷' : item === 'Applications' ? '▦' : item === 'Downloads' ? '↓' : item === 'Pictures' ? '▧' : '▤'} <span>{item}</span></button>
			{/each}
		</aside>
		<main>
			<div class="search-row"><input bind:value={search} placeholder="Search this Mac" aria-label="Search files" /></div>
			{#if creating}
				<form class="create-row" onsubmit={createFolder}><input bind:value={new_folder} placeholder="Folder name" aria-label="Folder name" /><button type="submit">Create</button><button type="button" onclick={() => (creating = false)}>Cancel</button></form>
			{/if}
			{#if notice}<p class="notice" role="status">{notice}</p>{/if}
			<div class="file-grid">
				{#each visible as entry (entry.id)}
					<button class="file" class:selected={selected === entry.id} onclick={() => openEntry(entry)} ondblclick={() => openEntry(entry)}>
						<span class="file-icon">{entry.kind === 'folder' ? '📁' : '📄'}</span><span>{entry.name}</span>
					</button>
				{:else}
					<p class="empty">This folder is empty.</p>
				{/each}
			</div>
			<footer>{visible.length} items · Saved in this browser</footer>
		</main>
	</div>
</section>

<style>
	.finder { height:100%; width:100%; display:flex; flex-direction:column; overflow:hidden; border-radius:inherit; background:var(--system-color-light); color:var(--system-color-light-contrast); }.toolbar { min-height:3.2rem; display:flex; align-items:center; justify-content:space-between; padding:0 .9rem; border-bottom:1px solid hsla(var(--system-color-dark-hsl),.12); }.toolbar strong { font-size:.85rem; }.nav-buttons,.toolbar-actions { display:flex; align-items:center; gap:.35rem; }.toolbar button,.create-row button { border-radius:6px; padding:.35rem .55rem; background:hsla(var(--system-color-dark-hsl),.07); font-size:.72rem; }.toolbar button:disabled { opacity:.35; }.body { display:grid; grid-template-columns:155px minmax(0,1fr); flex:1; min-height:0; }.sidebar { padding:.8rem .6rem; background:hsla(var(--system-color-dark-hsl),.045); border-right:1px solid hsla(var(--system-color-dark-hsl),.1); }.sidebar p { padding:0 .5rem; margin:.3rem 0 .5rem; color:hsla(var(--system-color-dark-hsl),.5); font-size:.68rem; font-weight:650; }.sidebar button { display:flex; gap:.5rem; width:100%; padding:.5rem; border-radius:6px; text-align:left; font-size:.75rem; }.sidebar button.active { background:var(--system-color-primary); color:white; }.body main { display:flex; flex-direction:column; min-width:0; }.search-row { padding:.7rem; border-bottom:1px solid hsla(var(--system-color-dark-hsl),.08); }.search-row input,.create-row input { width:100%; padding:.45rem .6rem; border-radius:7px; background:hsla(var(--system-color-dark-hsl),.07); color:inherit; font-size:.75rem; }.create-row { display:flex; gap:.4rem; padding:.6rem; }.create-row input { flex:1; min-width:0; }.create-row button:first-of-type { background:var(--system-color-primary); color:white; }.notice { padding:0 .8rem; font-size:.7rem; color:var(--system-color-primary); }.file-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); align-content:start; gap:.5rem; padding:1rem; overflow:auto; flex:1; }.file { display:flex; flex-direction:column; align-items:center; gap:.35rem; padding:.6rem .3rem; border-radius:8px; font-size:.68rem; overflow-wrap:anywhere; }.file.selected,.file:hover { background:hsla(var(--system-color-primary-hsl),.15); }.file-icon { font-size:2.3rem; }.empty { grid-column:1/-1; text-align:center; opacity:.5; padding:2rem; }.body footer { border-top:1px solid hsla(var(--system-color-dark-hsl),.1); padding:.45rem .8rem; font-size:.65rem; opacity:.55; }
</style>