import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{svelte,js,ts,html,css}'],
	theme: {
		extend: {}
	},
	plugins: [daisyui, typography()]
};
