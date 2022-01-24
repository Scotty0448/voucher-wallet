import { readable, writable, derived } from 'svelte-persistent-store/dist/session'

export const seed = writable('seed', '')
export const message = writable('message', '')
