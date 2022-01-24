<script>
  import triplesec  from 'triplesec'
  import Buffer     from 'buffer/'

  import { validateMnemonic, seedFromMnemonic, addressFromSeed } from './Utils.svelte'

  import Modal        from './Modal.svelte'
  import Authenticate	from './Authenticate.svelte'
  import Spinner      from './Spinner.svelte'

  import { em }                   from '../local_stores.js'
  import { seed }                 from '../session_stores.js'
  import { address, view_stack }  from '../stores.js'
  import { network }              from '../config.js'

  let words
  let pin
  let message
  let wait = false

  function import_words() {
    message = ''
    if (words) {
      words = words.trim().replace(/ +(?= )/g,'')
      if (words.split(' ').length == 12) {
        if (validateMnemonic(words)) {
          wait = true
          triplesec.encrypt({ data:triplesec.Buffer.from(words), key:triplesec.Buffer.from(pin) }, function(err, buff) {
            wait = false
            if (!err) {
              $em = buff.toString('hex')
              $seed = seedFromMnemonic(words)
              $address = addressFromSeed($seed, network)
              $view_stack = $view_stack.slice(0, -1)
            } else {
              message = err.message
            }
          })
        } else {
          message = "The words are not a valid set of recovery words."
        }
      } else {
        message = "There must be 12 recovery words."
      }
    }
  }
</script>

<Modal>
  {#if pin}
    <div class="text-gray-600 text-sm m-3">
      <div>Enter your 12 recovery words here. Enter them in the order originally shown to you and with a space between words.</div>
      <div><textarea class="w-full mt-3 h-20 px-2 py-1.5" spellcheck="false" autocorrect="off" autocapitalize="none" bind:value={words}></textarea></div>
      <div class="mt-2 text-center">
        <button class="w-28 mt-1 px-4 py-1 rounded text-white font-semibold text-sm border border-transparent bg-green-600 shadow-sm hover:bg-green-700 focus:outline-none border:outline-none inline-flex items-center justify-center" disabled={wait} on:click={import_words}>
          <div class="pr-2" hidden={!wait}><Spinner color="white" /></div>
          Import
        </button>
      </div>
    </div>
    {#if message}
      <div class="text-xs text-red-700 mt-4 mb-3 text-center">
        {message}
      </div>
    {/if}
  {:else}
    <div class="bg-white flex flex-col items-center pb-8">
      <Authenticate bind:pin={pin} />
    </div>
  {/if}
</Modal>
