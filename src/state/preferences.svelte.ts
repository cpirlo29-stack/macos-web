import { colors } from '🍎/configs/theme/colors.config.ts';
import type { WallpaperID } from '🍎/configs/wallpapers/wallpaper.config.ts';
import { persisted } from './persisted.svelte.ts';

export type WallpaperSettings = {
	id: WallpaperID;
	image: string;
	canControlTheme: boolean;
};

export type Theme = {
	scheme: 'light' | 'dark';
	primaryColor: keyof typeof colors;
};

export const preferences = persisted('macos:preferences', {
	reduced_motion: matchMedia('(prefers-reduced-motion)').matches,
	liquid_glass: true,
	glass_blur: 18,
	theme: {
		scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
		primaryColor: 'blue',
	} as Theme,
	wallpaper: {
		image: 'ventura-2',
		id: 'ventura',
		canControlTheme: true,
	} as WallpaperSettings,
});

$effect.root(() => {
	$effect(() => {
		const { classList, style } = document.body;
		classList.remove('light', 'dark');
		classList.add(preferences.theme.scheme);
		classList.toggle('liquid-glass', preferences.liquid_glass);
		style.setProperty('--glass-blur', `${preferences.glass_blur}px`);

		const colorObj = colors[preferences.theme.primaryColor][preferences.theme.scheme];
		style.setProperty('--system-color-primary', `hsl(${colorObj.hsl})`);
		style.setProperty('--system-color-primary-hsl', `${colorObj.hsl}`);
		style.setProperty('--system-color-primary-contrast', `hsl(${colorObj.contrastHsl})`);
		style.setProperty('--system-color-primary-contrast-hsl', `${colorObj.contrastHsl}`);
	});
});
