<script>
  import { view_stack } from '../stores.js'

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
</script>

<div class="mt-4 relative">
  <div class="absolute -top-3 -right-3 text-gray-400" on:click="{()=>{dispatch('modalClosed'); $view_stack = $view_stack.slice(0, -1)}}">
    <svg class="w-8 h-8" fill="#ffffff" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  </div>
  <div class="p-1 border border-gray-300 bg-white shadow-md">
    <slot />
  </div>
</div>
