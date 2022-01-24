<script>
  import Modal from './Modal.svelte'
  import Authenticate	from './Authenticate.svelte'

  import { em }       from '../local_stores.js'

  let pin
</script>

<Modal>
  {#if pin}
    <div class="bg-white flex flex-col items-center pb-8">
      <Authenticate bind:pin={pin} reset_pin=true />
    </div>
  {:else}
    <div class="bg-white flex flex-col items-center pb-8">
      <Authenticate bind:pin={pin} prepare=true />
    </div>
  {/if}
</Modal>
