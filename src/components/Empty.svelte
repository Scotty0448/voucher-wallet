<script>
  import Spinner            from './Spinner.svelte'

  import { coin, api_url }  from '../config.js'
  import { address }        from '../stores.js'

  let wait = false

  async function getSamples() {
    wait = true
    let resp = await fetch(`${api_url}/getSampleVouchers?address=${$address}`)
    let json = await resp.json()
  }
</script>

<div class="my-8">
  <div class="py-8 border border-gray-300 bg-white shadow-md rounded-lg flex flex-col items-center">
    <p class="mt-1 text-sm font-semibold text-gray-700">Your wallet is currently empty.</p>
    <div class="text-left mt-4 text-sm text-gray-700">
      Use the
      <span class="text-green-600 -mb-1 inline-block">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      </span>
      button above to show<br>
      your wallet address for receiving<br>
      new vouchers.
    </div>
  </div>

  {#if coin == 'trito'}
    <div class="mt-6 py-6 border border-gray-300 bg-white shadow-md rounded-lg flex flex-col items-center">
      <div class="text-left text-sm text-gray-700 w-64">
        <p>A random set of sample vouchers are
           available during the testing period.<p>
      </div>
      <button class="mt-4 px-4 py-1 rounded text-white font-semibold text-sm border border-transparent bg-yellow-600 shadow-sm hover:bg-yellow-700 focus:outline-none border:outline-none inline-flex items-center justify-center" disabled={wait} on:click={getSamples}>
        <div class="pr-2" hidden={!wait}><Spinner color="white" /></div>
        Get Sample Vouchers
      </button>
    </div>
  {/if}
</div>
