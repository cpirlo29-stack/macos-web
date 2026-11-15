<script lang="ts">
	import { onMount } from 'svelte';
	import { addMonths, format, isSameMonth, parseISO } from 'date-fns';
	import LeftArrow from '~icons/ic/round-chevron-left';
	import RightArrow from '~icons/ic/round-chevron-right';
	import { preferences } from '🍎/state/preferences.svelte.ts';
	import MonthView from './MonthView.svelte';

	const { view = 'month' }: { view?: 'year' | 'month' | 'week' | 'day' } = $props();
	type CalendarEvent = { id: number; title: string; date: string };
	let selected_date = $state(new Date());
	let events = $state<CalendarEvent[]>([]);
	let event_title = $state('');
	let event_date = $state(format(new Date(), 'yyyy-MM-dd'));
	let event_error = $state('');

	onMount(() => {
		try { events = JSON.parse(localStorage.getItem('macos-web-calendar-events') || '[]'); }
		catch { events = []; }
	});
	const month_events = $derived(events.filter((event) => {
		try { return isSameMonth(parseISO(event.date), selected_date); } catch { return false; }
	}).sort((a, b) => a.date.localeCompare(b.date)));

	function saveEvents() {
		localStorage.setItem('macos-web-calendar-events', JSON.stringify(events));
	}
	function addEvent(event: SubmitEvent) {
		event.preventDefault();
		const title = event_title.trim();
		if (!title || !event_date) { event_error = 'Enter an event name and date.'; return; }
		events = [...events, { id: Date.now(), title, date: event_date }];
		saveEvents();
		event_title = '';
		event_error = '';
	}
	function deleteEvent(id: number) {
		events = events.filter((event) => event.id !== id);
		saveEvents();
	}
	function goToToday() { selected_date = new Date(); event_date = format(new Date(), 'yyyy-MM-dd'); }
	function goPreviousMonth() { selected_date = addMonths(selected_date, -1); }
	function goNextMonth() { selected_date = addMonths(selected_date, 1); }
</script>

<section class="container" class:dark={preferences.theme.scheme === 'dark'}>
	<header class="app-window-drag-handle titlebar"></header>
	<section class="main-area">
		<div class="calendar-header">
			<div><span class="month">{format(selected_date, 'MMMM')}</span><span class="year">{format(selected_date, 'yyyy')}</span></div>
			<div class="control-buttons">
				<button onclick={goPreviousMonth} aria-label="Previous month"><LeftArrow /></button>
				<button onclick={goToToday}>Today</button>
				<button onclick={goNextMonth} aria-label="Next month"><RightArrow /></button>
			</div>
		</div>
		{#if view === 'month'}
			<MonthView selected_date={selected_date} />
		{:else}
			<div class="alternate-view">The {view} view is not available yet. Choose month view to see the calendar.</div>
		{/if}
		<div class="events-panel">
			<h2>Events in {format(selected_date, 'MMMM')}</h2>
			{#if month_events.length}
				<ul>{#each month_events as item (item.id)}
					<li><span class="event-date">{format(parseISO(item.date), 'MMM d')}</span><span class="event-title">{item.title}</span><button aria-label="Delete {item.title}" onclick={() => deleteEvent(item.id)}>×</button></li>
				{/each}</ul>
			{:else}
				<p class="empty">No events this month yet.</p>
			{/if}
			<form onsubmit={addEvent}>
				<input aria-label="Event name" placeholder="New event name" bind:value={event_title} maxlength="80" />
				<input aria-label="Event date" type="date" bind:value={event_date} />
				<button type="submit">Add event</button>
			</form>
			{#if event_error}<p class="error" role="alert">{event_error}</p>{/if}
			<p class="storage-note">Events are saved in this browser on this device.</p>
		</div>
	</section>
</section>

<style>
	.container { --title-bar-height:2.5rem; background-color:var(--system-color-light); border-radius:inherit; overflow:hidden; }
	.titlebar { padding:1rem; width:100%; height:var(--title-bar-height); position:absolute; top:0; left:0; }
	.main-area { color:var(--system-color-light-contrast); margin-top:var(--title-bar-height); height:calc(100% - var(--title-bar-height)); width:100%; overflow:auto; display:flex; flex-direction:column; }
	.calendar-header { display:flex; align-items:center; justify-content:space-between; padding:10px; }
	.month,.year { font-size:1.5rem; }.month { font-weight:bold; margin-right:.35rem; }
	.control-buttons { display:flex; align-items:center; gap:.15rem; }
	.control-buttons button { border-radius:.375rem; box-shadow:hsla(var(--system-color-dark-hsl),.4) 0 .5px 2px; background:hsla(var(--system-color-light-hsl),.5); color:var(--system-color-dark); font-weight:bold; padding:.2rem .5rem; min-height:1.7rem; }
	:global(body.dark) .control-buttons button { background:var(--system-color-grey-800); }
	:global(.control-buttons svg) { font-size:1.2rem; }
	.events-panel { padding:1rem; border-top:1px solid hsla(var(--system-color-dark-hsl),.12); }.events-panel h2 { margin:0 0 .7rem; font-size:.95rem; }
	.events-panel ul { list-style:none; padding:0; margin:0 0 .8rem; }.events-panel li { display:flex; align-items:center; gap:.65rem; padding:.35rem 0; border-bottom:1px solid hsla(var(--system-color-dark-hsl),.08); font-size:.8rem; }.event-date { color:var(--system-color-primary); font-weight:650; min-width:3.5rem; }.event-title { flex:1; }.events-panel li button { font-size:1.2rem; padding:0 .4rem; opacity:.6; }.events-panel form { display:flex; flex-wrap:wrap; gap:.45rem; }.events-panel input { min-width:0; padding:.45rem .55rem; border:1px solid hsla(var(--system-color-dark-hsl),.18); border-radius:6px; background:transparent; color:inherit; font:inherit; font-size:.75rem; }.events-panel input:first-child { flex:1; }.events-panel form button { padding:.45rem .7rem; border-radius:6px; background:var(--system-color-primary); color:white; font-size:.75rem; }.empty,.storage-note,.error,.alternate-view { font-size:.72rem; opacity:.65; }.storage-note { margin:.55rem 0 0; }.error { color:#d33; opacity:1; }.alternate-view { padding:2rem; text-align:center; }
</style>