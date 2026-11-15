<script lang="ts">
	import { onMount } from 'svelte';

	type Bookmark = { title: string; url: string };

	const startLinks = [
		{ title: 'Google', url: 'https://www.google.com', symbol: 'G' },
		{ title: 'Wikipedia', url: 'https://www.wikipedia.org', symbol: 'W' },
		{ title: 'YouTube', url: 'https://www.youtube.com', symbol: '▶' },
		{ title: 'GitHub', url: 'https://github.com', symbol: '⌘' },
		{ title: 'OpenAI', url: 'https://openai.com', symbol: '◎' },
		{ title: 'DuckDuckGo', url: 'https://duckduckgo.com', symbol: 'D' },
	];

	let address = $state('');
	let currentUrl = $state('');
	let pageTitle = $state('Start Page');
	let historyItems = $state<string[]>([]);
	let historyIndex = $state(-1);
	let bookmarks = $state<Bookmark[]>([]);
	let isLoading = $state(false);
	let reloadKey = $state(0);
	let message = $state('');

	const canGoBack = $derived(historyIndex > 0);
	const canGoForward = $derived(historyIndex >= 0 && historyIndex < historyItems.length - 1);
	const isBookmarked = $derived(!!currentUrl && bookmarks.some((item) => item.url === currentUrl));
	const recentHistory = $derived(historyItems.slice(-5).reverse());

	onMount(() => {
		try {
			const savedBookmarks = JSON.parse(localStorage.getItem('macos-web-safari-bookmarks') || '[]');
			if (Array.isArray(savedBookmarks)) {
				bookmarks = savedBookmarks.filter((item): item is Bookmark =>
					!!item && typeof item.title === 'string' && typeof item.url === 'string'
				);
			}
			const savedHistory = JSON.parse(localStorage.getItem('macos-web-safari-history') || '[]');
			if (Array.isArray(savedHistory)) {
				historyItems = savedHistory.filter((item): item is string => typeof item === 'string').slice(-50);
			}
		} catch {
			bookmarks = [];
			historyItems = [];
		}
	});

	function persistBookmarks() {
		try {
			localStorage.setItem('macos-web-safari-bookmarks', JSON.stringify(bookmarks));
		} catch {
			message = 'Could not save bookmarks in this browser.';
		}
	}

	function persistHistory() {
		try {
			localStorage.setItem('macos-web-safari-history', JSON.stringify(historyItems.slice(-50)));
		} catch {
			// Browsing still works when local storage is unavailable.
		}
	}

	function resolveAddress(value: string): string | null {
		const query = value.trim();
		if (!query) return null;

		if (/^https?:\/\//i.test(query)) {
			try {
				const parsed = new URL(query);
				return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
			} catch {
				return null;
			}
		}

		if (/^[a-z][a-z\d+.-]*:\/\//i.test(query)) return null;

		if (query.includes(' ') || (!query.includes('.') && !/^localhost(?::\d+)?(\/|$)/i.test(query))) {
			return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
		}

		try {
			return new URL(`https://${query}`).href;
		} catch {
			return null;
		}
	}

	function navigate(value: string) {
		const nextUrl = resolveAddress(value);
		if (!nextUrl) {
			message = 'Enter a valid website address or search term.';
			return;
		}

		if (historyIndex < historyItems.length - 1) {
			historyItems = historyItems.slice(0, historyIndex + 1);
		}
		historyItems = [...historyItems, nextUrl].slice(-50);
		historyIndex = historyItems.length - 1;
		currentUrl = nextUrl;
		address = nextUrl;
		pageTitle = getPageTitle(nextUrl);
		isLoading = true;
		message = '';
		reloadKey += 1;
		persistHistory();
	}

	function getPageTitle(value: string): string {
		try {
			return new URL(value).hostname.replace(/^www\./, '');
		} catch {
			return 'Safari';
		}
	}

	function submitAddress(event: SubmitEvent) {
		event.preventDefault();
		navigate(address);
	}

	function goBack() {
		if (!canGoBack) return;
		historyIndex -= 1;
		currentUrl = historyItems[historyIndex];
		address = currentUrl;
		pageTitle = getPageTitle(currentUrl);
		isLoading = true;
		message = '';
		reloadKey += 1;
	}

	function goForward() {
		if (!canGoForward) return;
		historyIndex += 1;
		currentUrl = historyItems[historyIndex];
		address = currentUrl;
		pageTitle = getPageTitle(currentUrl);
		isLoading = true;
		message = '';
		reloadKey += 1;
	}

	function reloadPage() {
		if (!currentUrl) return;
		isLoading = true;
		message = '';
		reloadKey += 1;
	}

	function goHome() {
		currentUrl = '';
		address = '';
		pageTitle = 'Start Page';
		isLoading = false;
		message = '';
	}

	function toggleBookmark() {
		if (!currentUrl) return;
		if (isBookmarked) {
			bookmarks = bookmarks.filter((item) => item.url !== currentUrl);
		} else {
			bookmarks = [{ title: getPageTitle(currentUrl), url: currentUrl }, ...bookmarks].slice(0, 30);
		}
		persistBookmarks();
	}

	function removeBookmark(url: string) {
		bookmarks = bookmarks.filter((item) => item.url !== url);
		persistBookmarks();
	}

	function openInNewTab(url = currentUrl) {
		if (!url) return;
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	function handleFrameLoad() {
		isLoading = false;
	}
</script>

<section class="safari">
	<header class="toolbar app-window-drag-handle">
		<div class="window-controls-spacer" aria-hidden="true"></div>
		<div class="navigation">
			<button type="button" aria-label="Go back" title="Back" disabled={!canGoBack} onclick={goBack}>‹</button>
			<button type="button" aria-label="Go forward" title="Forward" disabled={!canGoForward} onclick={goForward}>›</button>
			<button type="button" aria-label="Reload page" title="Reload" disabled={!currentUrl} onclick={reloadPage}>↻</button>
			<button type="button" aria-label="Start page" title="Start Page" onclick={goHome}>⌂</button>
		</div>
		<form class="address-form" onsubmit={submitAddress}>
			<span class="lock" aria-hidden="true">⌑</span>
			<input bind:value={address} aria-label="Website address or search" placeholder="Search or enter website name" autocomplete="url" spellcheck="false" />
			<button type="submit" aria-label="Go to address" title="Go">↵</button>
		</form>
		<div class="toolbar-actions">
			<button type="button" aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'} title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'} disabled={!currentUrl} onclick={toggleBookmark}>{isBookmarked ? '★' : '☆'}</button>
			<button type="button" aria-label="Open current page in a new tab" title="Open in new tab" disabled={!currentUrl} onclick={() => openInNewTab()}>↗</button>
		</div>
	</header>

	{#if bookmarks.length > 0}
		<nav class="bookmarks" aria-label="Bookmarks">
			{#each bookmarks as bookmark}
				<div class="bookmark">
					<button type="button" title={bookmark.url} onclick={() => navigate(bookmark.url)}>{bookmark.title}</button>
					<button class="remove-bookmark" type="button" aria-label="Remove {bookmark.title} bookmark" onclick={() => removeBookmark(bookmark.url)}>×</button>
				</div>
			{/each}
		</nav>
	{/if}

	{#if message}
		<p class="message" role="status">{message}</p>
	{/if}

	{#if currentUrl}
		<div class="page-heading">
			<span>{pageTitle}</span>
			{#if isLoading}<span class="loading-label">Loading…</span>{:else}<span class="loading-label">Web page</span>{/if}
		</div>
		<div class="web-view">
			{#if isLoading}<div class="loading-bar" aria-label="Loading page"></div>{/if}
			{#key `${currentUrl}:${reloadKey}`}
				<iframe
					title={pageTitle}
					src={currentUrl}
					onload={handleFrameLoad}
					referrerpolicy="strict-origin-when-cross-origin"
					allow="fullscreen; autoplay; clipboard-read; clipboard-write"
				></iframe>
			{/key}
			<div class="embed-help">
				Some websites block display inside another app. <button type="button" onclick={() => openInNewTab()}>Open this page in a new tab ↗</button>
			</div>
		</div>
	{:else}
		<div class="start-page">
			<div class="start-content">
				<div class="safari-mark">◉</div>
				<h1>Safari</h1>
				<p class="tagline">A faster way to explore the web.</p>
				<form class="start-search" onsubmit={submitAddress}>
					<span aria-hidden="true">⌕</span>
					<input bind:value={address} aria-label="Search the web" placeholder="Search the web or enter a website" autocomplete="url" />
					<button type="submit">Go</button>
				</form>
				<section class="favorites">
					<h2>Favorites</h2>
					<div class="favorite-grid">
						{#each startLinks as link}
							<button type="button" class="favorite" onclick={() => navigate(link.url)}>
								<span class="favorite-icon">{link.symbol}</span>
								<span>{link.title}</span>
							</button>
						{/each}
						{#each bookmarks.slice(0, 6) as bookmark}
							<button type="button" class="favorite" onclick={() => navigate(bookmark.url)}>
								<span class="favorite-icon bookmark-icon">★</span>
								<span>{bookmark.title}</span>
							</button>
						{/each}
					</div>
				</section>
				{#if recentHistory.length > 0}
					<section class="recent">
						<h2>Recently Visited</h2>
						{#each recentHistory as item}
							<button type="button" onclick={() => navigate(item)}>{getPageTitle(item)} <span>{item}</span></button>
						{/each}
					</section>
				{/if}
				<p class="privacy-note">Your bookmarks and recent pages are saved locally in this browser.</p>
			</div>
		</div>
	{/if}
</section>

<style>
	.safari { height:100%; width:100%; display:flex; flex-direction:column; overflow:hidden; border-radius:inherit; background:#f5f5f7; color:#25252a; font-family:var(--system-font-family, Arial,sans-serif); }
	.toolbar { min-height:3.35rem; display:grid; grid-template-columns:auto minmax(0,1fr) minmax(180px,1.7fr) auto; align-items:center; gap:.75rem; padding:0 .9rem; background:#f5f5f7; border-bottom:1px solid rgba(0,0,0,.1); }
	.window-controls-spacer { width:2.7rem; }
	.navigation,.toolbar-actions { display:flex; align-items:center; gap:.25rem; }
	.toolbar button { width:1.85rem; height:1.85rem; border-radius:7px; display:grid; place-items:center; font-size:1.1rem; color:#444; background:rgba(0,0,0,.055); }
	.toolbar button:disabled { opacity:.3; cursor:default; }
	.address-form { display:flex; align-items:center; min-width:0; height:2rem; gap:.35rem; padding:0 .5rem; border:1px solid rgba(0,0,0,.1); border-radius:8px; background:#e8e8eb; }
	.address-form:focus-within { background:white; border-color:#85aee9; box-shadow:0 0 0 2px rgba(55,125,220,.14); }
	.address-form input,.start-search input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:#222; font-size:.76rem; }
	.address-form button { width:1.45rem; height:1.45rem; font-size:.85rem; background:rgba(0,0,0,.08); }
	.lock { font-size:.82rem; opacity:.55; }
	.bookmarks { min-height:2.15rem; padding:0 .8rem; display:flex; align-items:center; gap:.45rem; overflow-x:auto; background:#f5f5f7; border-bottom:1px solid rgba(0,0,0,.08); }
	.bookmark { display:flex; align-items:center; flex:0 0 auto; border-radius:6px; background:rgba(0,0,0,.055); }
	.bookmark button { padding:.3rem .45rem; font-size:.68rem; white-space:nowrap; }
	.bookmark .remove-bookmark { padding-left:.1rem; color:#777; font-size:.85rem; }
	.message { margin:0; padding:.4rem .8rem; font-size:.7rem; color:#a14b24; background:#fff4e9; }
	.page-heading { min-height:1.8rem; padding:0 .85rem; display:flex; align-items:center; justify-content:space-between; color:#777; background:#fff; font-size:.65rem; }
	.loading-label { color:#8b8b91; }
	.web-view { position:relative; flex:1; min-height:0; background:#fff; }
	.web-view iframe { width:100%; height:100%; border:0; background:white; }
	.loading-bar { position:absolute; z-index:2; top:0; left:0; height:2px; width:35%; background:#1684e8; animation:loading 1.3s ease-in-out infinite; pointer-events:none; }
	@keyframes loading { from { transform:translateX(-100%); } to { transform:translateX(300%); } }
	.embed-help { position:absolute; right:.65rem; bottom:.6rem; max-width:calc(100% - 1.3rem); padding:.45rem .65rem; border:1px solid rgba(0,0,0,.08); border-radius:7px; color:#555; background:rgba(255,255,255,.94); box-shadow:0 2px 9px rgba(0,0,0,.1); font-size:.62rem; }
	.embed-help button { color:#0878df; font-weight:650; }
	.start-page { flex:1; min-height:0; overflow:auto; display:flex; justify-content:center; padding:2.4rem 1.2rem; background:radial-gradient(ellipse at 50% 15%,#fff 0%,#f3f4f8 65%,#e9ebf1 100%); }
	.start-content { width:min(650px,100%); text-align:center; }
	.safari-mark { width:3.4rem; height:3.4rem; margin:0 auto .6rem; display:grid; place-items:center; border-radius:50%; color:white; background:linear-gradient(135deg,#4eb7f4,#2262c9); box-shadow:0 5px 15px rgba(41,111,193,.25); font-size:2rem; }
	.start-content h1 { margin:0; color:#33343a; font-size:2rem; font-weight:650; letter-spacing:-.04em; }
	.tagline { margin:.35rem 0 1.5rem; color:#85858d; font-size:.8rem; }
	.start-search { height:2.8rem; max-width:510px; margin:0 auto 2rem; padding:0 .65rem; display:flex; align-items:center; gap:.55rem; border:1px solid rgba(0,0,0,.1); border-radius:11px; background:rgba(255,255,255,.9); box-shadow:0 4px 16px rgba(0,0,0,.06); text-align:left; }
	.start-search>span { color:#888; font-size:1.3rem; }
	.start-search input { font-size:.78rem; }
	.start-search button { padding:.35rem .8rem; border-radius:7px; color:white; background:#1677d2; font-size:.7rem; font-weight:650; }
	.favorites,.recent { max-width:550px; margin:0 auto 1.5rem; text-align:left; }
	.favorites h2,.recent h2 { margin:0 0 .7rem; color:#55565e; font-size:.78rem; font-weight:650; }
	.favorite-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(95px,1fr)); gap:.55rem; }
	.favorite { min-height:5.3rem; padding:.55rem .25rem; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.45rem; border:1px solid rgba(0,0,0,.055); border-radius:10px; background:rgba(255,255,255,.78); color:#4e4e56; font-size:.68rem; }
	.favorite:hover { background:white; box-shadow:0 3px 12px rgba(0,0,0,.07); }
	.favorite-icon { width:2rem; height:2rem; display:grid; place-items:center; border-radius:9px; color:#fff; background:linear-gradient(140deg,#63a8f0,#3169bd); font-size:1.05rem; font-weight:700; }
	.bookmark-icon { color:#fff; background:linear-gradient(140deg,#f4be55,#e58e2b); }
	.recent { display:flex; flex-direction:column; gap:.25rem; }
	.recent h2 { margin-bottom:.3rem; }
	.recent button { padding:.45rem .5rem; display:flex; justify-content:space-between; gap:.75rem; border-radius:6px; color:#4c4c55; text-align:left; font-size:.68rem; }
	.recent button:hover { background:rgba(255,255,255,.8); }
	.recent button span { max-width:70%; overflow:hidden; color:#999; text-overflow:ellipsis; white-space:nowrap; }
	.privacy-note { margin:1rem 0 0; color:#9a9aa1; font-size:.62rem; }
	@media (max-width:650px) { .toolbar { grid-template-columns:auto minmax(0,1fr) auto; gap:.35rem; padding:0 .45rem; }.window-controls-spacer { display:none; }.navigation button:nth-child(4) { display:none; }.address-form { grid-column:2; grid-row:1; }.toolbar-actions { grid-column:3; grid-row:1; }.navigation { grid-column:1; grid-row:1; }.start-page { padding:1.5rem .8rem; } }
</style>
