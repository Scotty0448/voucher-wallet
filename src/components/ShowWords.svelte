<script>
  import Modal        from './Modal.svelte'
  import Authenticate	from './Authenticate.svelte'

  import triplesec    from 'triplesec'
  import Buffer       from 'buffer/'

  import { em }       from '../local_stores.js'

  let pin
  let words
  let error

  $: { get_words(pin) }

  function get_words(pin) {
    if (pin) {
      triplesec.decrypt({ data:triplesec.Buffer.from($em, 'hex'), key:triplesec.Buffer.from(pin) }, function (err, buff) {
        if (!err) {
          let mnemonic = buff.toString()
          if (mnemonic != '') {
            words = mnemonic.split(' ')
          }
        } else {
          error = err.message
        }
      })
    }
  }
</script>

<Modal>
  {#if pin}
    <div class="text-gray-600 text-sm p-1">
      <p class="p-2">Your recovery words are 12 words that you can use to recover your vouchers if they have been lost due to changing browsers, getting a new device or forgetting your PIN.</p>
      <p class="p-2">It is important to write these words down, in the order shown, and store them in a safe place in case you need them in the future.</p>
      <p class="p-2">Keep your words strictly private because anyone with your words can gain access to your vouchers.</p>
    </div>
    {#if words || error}
      <div class="mt-1 mb-3 mx-3 py-2 px-1 border border-gray-300 text-center text-xs">
        {#if error}
          <div class="m-1 text-xs text-red-700 text-center">{error}</div>
        {:else}
          {#if words && words.length==12}
            {#each words as word, idx}
              <div class="border border-gray-200 m-1 p-1 inline-block text-left" style="width:88px"><span class="text-gray-400 px-1">{idx+1}</span> <span class="text-gray-900">{word}</span></div>
            {/each}
          {/if}
        {/if}
      </div>
    {/if}
  {:else}
    <div class="bg-white flex flex-col items-center pb-8">
      <Authenticate bind:pin={pin} />
    </div>
  {/if}
</Modal>
