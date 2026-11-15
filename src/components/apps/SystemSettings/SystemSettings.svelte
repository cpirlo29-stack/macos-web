<script lang="ts">
	import { colors } from '🍎/configs/theme/colors.config';
	import { apps } from '🍎/state/apps.svelte';
	import { preferences } from '🍎/state/preferences.svelte';

	type Section = 'appearance' | 'general' | 'accessibility' | 'wallpaper';
	let section = $state<Section>('appearance');

	const sections: { id: Section; label: string; symbol: string }[] = [
		{ id: 'appearance', label: 'Appearance', symbol: '◐' },
		{ id: 'general', label: 'General', symbol: '⚙' },
		{ id: 'accessibility', label: 'Accessibility', symbol: '◉' },
		{ id: 'wallpaper', label: 'Wallpaper', symbol: '▧' },
	];

	const colorNames = Object.keys(colors) as (keyof typeof colors)[];
</script>

<section class="settings-window">
	<header class="titlebar app-window-drag-handle">
		<div class="traffic-placeholder" aria-hidden="true"><i></i><i></i><i></i></div>
		<strong>System Settings</strong>
	</header>

	<div class="settings-layout">
		<aside class="sidebar">
			<div class="profile">
				<div class="avatar">C</div>
				<div><strong>My Mac</strong><small>macOS Web</small></div>
			</div>
			<nav aria-label="Settings sections">
				{#each sections as item}
					<button class:chosen={section === item.id} onclick={() => (section = item.id)}>
						<span class="symbol">{item.symbol}</span>{item.label}
					</button>
				{/each}
			</nav>
			<div class="sidebar-foot">Settings are saved automatically</div>
		</aside>

		<main class="content">
			{#if section === 'appearance'}
				<h1>Appearance</h1>
				<p class="intro">Customize the look and feel of your desktop.</p>

				<section class="group">
					<h2>Appearance</h2>
					<div class="theme-options">
						<button class:chosen={preferences.theme.scheme === 'light'} onclick={() => (preferences.theme.scheme = 'light')}>
							<span class="theme-preview light-preview"><b></b><i></i></span>
							<span>Light</span>
						</button>
						<button class:chosen={preferences.theme.scheme === 'dark'} onclick={() => (preferences.theme.scheme = 'dark')}>
							<span class="theme-preview dark-preview"><b></b><i></i></span>
							<span>Dark</span>
						</button>
					</div>
					<div class="setting-row">
						<div><strong>Accent color</strong><small>Choose the color used for controls and highlights.</small></div>
						<div class="swatches">
							{#each colorNames as color}
								<button class="swatch" class:selected={preferences.theme.primaryColor === color} style:--swatch={`hsl(${colors[color][preferences.theme.scheme].hsl})`} aria-label={color} title={color} onclick={() => (preferences.theme.primaryColor = color)}></button>
							{/each}
						</div>
					</div>
				</section>

				<section class="group">
					<h2>Liquid Glass</h2>
					<div class="setting-row">
						<div><strong>Use Liquid Glass</strong><small>Apply translucent surfaces and background blur across the desktop.</small></div>
						<button class="switch" class:on={preferences.liquid_glass} role="switch" aria-checked={preferences.liquid_glass} onclick={() => (preferences.liquid_glass = !preferences.liquid_glass)}><span></span></button>
					</div>
					<div class="setting-row range-row" class:muted={!preferences.liquid_glass}>
						<div><strong>Glass blur</strong><small>Adjust the strength of the glass effect.</small></div>
						<div class="range-control">
							<input type="range" min="0" max="32" step="1" value={preferences.glass_blur} disabled={!preferences.liquid_glass} oninput={(event) => (preferences.glass_blur = Number(event.currentTarget.value))} />
							<output>{preferences.glass_blur}px</output>
						</div>
					</div>
				</section>
			{:else if section === 'general'}
				<h1>General</h1>
				<p class="intro">Basic desktop preferences.</p>
				<section class="group">
					<h2>Desktop</h2>
					<div class="setting-row"><div><strong>System version</strong><small>macOS Web · Svelte Edition</small></div><span class="value">13.0</span></div>
					<div class="setting-row"><div><strong>Preferences storage</strong><small>Your settings are stored in this browser.</small></div><span class="status">On</span></div>
				</section>
			{:else if section === 'accessibility'}
				<h1>Accessibility</h1>
				<p class="intro">Make the interface more comfortable to use.</p>
				<section class="group">
					<h2>Motion</h2>
					<div class="setting-row">
						<div><strong>Reduce motion</strong><small>Limit animated transitions and movement.</small></div>
						<button class="switch" class:on={preferences.reduced_motion} role="switch" aria-checked={preferences.reduced_motion} onclick={() => (preferences.reduced_motion = !preferences.reduced_motion)}><span></span></button>
					</div>
				</section>
			{:else}
				<h1>Wallpaper</h1>
				<p class="intro">Personalize your desktop background.</p>
				<section class="group">
					<div class="wallpaper-card">
						<div class="wallpaper-art"></div>
						<div><strong>Current wallpaper</strong><small>{preferences.wallpaper.id} · {preferences.wallpaper.image}</small></div>
					</div>
					<button class="primary-button" onclick={() => { apps.open.wallpapers = true; apps.active = 'wallpapers'; }}>Open Wallpaper Gallery</button>
				</section>
			{/if}
		</main>
	</div>
</section>

<style>
	.settings-window { height:100%; width:100%; overflow:hidden; border-radius:inherit; background:var(--system-color-light); color:var(--system-color-light-contrast); display:flex; flex-direction:column; font-family:var(--system-font-family); }
	.titlebar { height:3.2rem; min-height:3.2rem; display:flex; align-items:center; justify-content:center; position:relative; border-bottom:1px solid hsla(var(--system-color-dark-hsl),.09); font-size:.88rem; }
	.traffic-placeholder { position:absolute; left:1rem; display:flex; gap:7px; }
	.traffic-placeholder i { width:12px; height:12px; border-radius:50%; background:#ff5f57; }
	.traffic-placeholder i:nth-child(2) { background:#febc2e; }.traffic-placeholder i:nth-child(3) { background:#28c840; }
	.settings-layout { display:grid; grid-template-columns:205px minmax(0,1fr); min-height:0; flex:1; }
	.sidebar { background:hsla(var(--system-color-dark-hsl),.045); border-right:1px solid hsla(var(--system-color-dark-hsl),.08); padding:1.1rem .8rem; display:flex; flex-direction:column; min-width:0; }
	.profile { display:flex; align-items:center; gap:.65rem; padding:.45rem .35rem 1.25rem; }
	.avatar { width:38px; height:38px; border-radius:11px; display:grid; place-items:center; color:white; font-size:1.25rem; font-weight:600; background:linear-gradient(145deg,#7bc5f8,#4265b5); }
	.profile strong,.profile small,.setting-row strong,.setting-row small,.wallpaper-card strong,.wallpaper-card small { display:block; }
	.profile strong { font-size:.85rem; }.profile small,.setting-row small,.wallpaper-card small { color:hsla(var(--system-color-dark-hsl),.58); font-size:.72rem; margin-top:3px; }
	nav { display:grid; gap:3px; }
	nav button { justify-content:flex-start; gap:.65rem; width:100%; border-radius:7px; padding:.58rem .65rem; font-size:.82rem; color:inherit; }
	nav button.chosen { background:var(--system-color-primary); color:var(--system-color-primary-contrast); }
	.symbol { width:18px; text-align:center; font-size:1rem; }
	.sidebar-foot { margin-top:auto; padding:.6rem .35rem 0; color:hsla(var(--system-color-dark-hsl),.48); font-size:.65rem; line-height:1.4; }
	.content { padding:1.8rem 2rem; overflow:auto; }
	h1 { font-size:1.65rem; margin:0; font-weight:650; letter-spacing:-.035em; }.intro { color:hsla(var(--system-color-dark-hsl),.58); font-size:.82rem; margin:.35rem 0 1.5rem; }
	.group { border:1px solid hsla(var(--system-color-dark-hsl),.12); border-radius:12px; padding:1rem; margin:0 0 1rem; background:hsla(var(--system-color-light-hsl),.35); }
	h2 { margin:0 0 .75rem; font-size:.85rem; font-weight:650; }
	.theme-options { display:flex; gap:1rem; margin-bottom:1rem; }
	.theme-options button { display:grid; gap:.4rem; justify-items:center; font-size:.72rem; }
	.theme-preview { width:112px; height:68px; border-radius:8px; border:2px solid transparent; display:block; position:relative; overflow:hidden; }
	.theme-options button.chosen .theme-preview { border-color:var(--system-color-primary); box-shadow:0 0 0 2px hsla(var(--system-color-primary-hsl),.2); }
	.light-preview { background:#f2f2f4; }.dark-preview { background:#242428; }
	.theme-preview b { position:absolute; left:0; top:0; width:25%; height:100%; background:#d9d9df; }.dark-preview b { background:#393940; }
	.theme-preview i { position:absolute; left:34%; top:18%; width:55%; height:65%; border-radius:4px; background:#fff; box-shadow:0 2px 5px #0002; }.dark-preview i { background:#505058; }
	.setting-row { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:.8rem 0; border-top:1px solid hsla(var(--system-color-dark-hsl),.09); }
	.setting-row strong { font-size:.8rem; font-weight:600; }.swatches { display:flex; gap:7px; }
	.swatch { width:19px; height:19px; border-radius:50%; background:var(--swatch); border:2px solid var(--system-color-light); box-shadow:0 0 0 1px transparent; }
	.swatch.selected { box-shadow:0 0 0 2px var(--system-color-primary); }
	.switch { width:39px; height:23px; flex:none; padding:2px; border-radius:99px; background:#929299; transition:background .18s; }
	.switch.on { background:#30c65a; }.switch span { display:block; width:19px; height:19px; border-radius:50%; background:white; box-shadow:0 1px 3px #0004; transition:transform .18s; }.switch.on span { transform:translateX(16px); }
	.range-control { display:flex; align-items:center; gap:.7rem; min-width:155px; }.range-control input { width:115px; accent-color:var(--system-color-primary); }.range-control output,.value,.status { font-size:.75rem; color:hsla(var(--system-color-dark-hsl),.65); min-width:34px; text-align:right; }.muted { opacity:.45; }
	.wallpaper-card { display:flex; align-items:center; gap:1rem; margin-bottom:1rem; }.wallpaper-art { width:100px; height:65px; border-radius:8px; background:linear-gradient(145deg,#f5b76b 0%,#e66b78 42%,#484c92 75%,#1c254f 100%); }
	.primary-button { background:var(--system-color-primary); color:var(--system-color-primary-contrast); border-radius:7px; padding:.55rem .85rem; font-size:.78rem; }
	@media(max-width:650px) { .settings-layout { grid-template-columns:145px minmax(0,1fr); }.content { padding:1.2rem; }.sidebar { padding:.8rem .5rem; }.theme-preview { width:88px; } }
</style>
