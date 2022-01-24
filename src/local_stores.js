import { readable, writable, derived } from 'svelte-persistent-store/dist/local'

if (localStorage.getItem('em') && localStorage.getItem('em') != '' && localStorage.getItem('em')[0] != '"') { localStorage.removeItem('em') }

export const em = writable('em', '')
