import type { apps_config } from '🍎/configs/apps/apps-config';

export type AppID = keyof typeof apps_config;

export const apps = $state({
	open: {
		wallpapers: false,
		finder: true,
		safari: false,
		vscode: false,
		calculator: false,
		appstore: false,
		calendar: false,
		'system-preferences': false,
		'purus-twitter': false,
		'view-source': true,
	} as Record<AppID, boolean>,

	active: 'finder' satisfies AppID,
	active_z_index: -2,

	z_indices: {
		wallpapers: 0,
		finder: 0,
		safari: 0,
		vscode: 0,
		calculator: 0,
		appstore: 0,
		calendar: 0,
		'system-preferences': 0,
		'purus-twitter': 0,
		'view-source': 0,
	} as Record<AppID, number>,

	is_being_dragged: false as boolean,

	fullscreen: {
		wallpapers: false,
		finder: false,
		safari: false,
		vscode: false,
		calculator: false,
		appstore: false,
		calendar: false,
		'system-preferences': false,
		'purus-twitter': false,
		'view-source': false,
	} as Record<AppID, boolean>,
});
