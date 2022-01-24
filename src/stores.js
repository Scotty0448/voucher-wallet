import { readable, writable, derived } from 'svelte/store'

export const address = writable()
export const view_stack = writable(['list'])
export const merchants = writable({})
export const vouchers = writable({})
export const selectedVoucherName = writable()
