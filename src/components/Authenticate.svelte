<script>
  import triplesec  from 'triplesec'
  import Buffer     from 'buffer/'

  import { generateMnemonic, seedFromMnemonic, addressFromSeed } from './Utils.svelte'

  import { network }              from '../config.js'
  import { em }                   from '../local_stores.js'
  import { seed, message }        from '../session_stores.js'
  import { address, view_stack }  from '../stores.js'

  export let pin
  export let prepare
  export let reset_pin

  let pin1 = ''
  let pin2 = ''
  let invalid_pin = false

  function reset() {
    pin1 = ''
    pin2 = ''
    invalid_pin = false
    $message = ''
  }

  function encrypt_mnemonic(mnemonic, pin) {
    triplesec.encrypt({ data:triplesec.Buffer.from(mnemonic), key:triplesec.Buffer.from(pin2) }, function(err, buff) {
      if (!err) {
        $em = buff.toString('hex')
        $seed = seedFromMnemonic(mnemonic)
        $address = addressFromSeed($seed, network)
        mnemonic = ''
        if (reset_pin) {
          $view_stack = $view_stack.slice(0, -1)
        }
      } else {
        $message = err.message
        mnemonic = ''
      }
    })
  }

  function loadMnemonic() {
    if (typeof(window.Storage)) {
      if ($em && !reset_pin) {
        triplesec.decrypt({ data:triplesec.Buffer.from($em, 'hex'), key:triplesec.Buffer.from(pin2) }, function (err, buff) {
          if (!err) {
            let mnemonic = buff.toString()
            if (mnemonic != '') {
              pin = pin1
              $seed = seedFromMnemonic(mnemonic)
              $address = addressFromSeed($seed, network)
              mnemonic = ''
              pin1 = ''
              pin2 = ''
              window.scrollTo(0,0)
            } else {
              $message = 'Blank mnemonic'
            }
          } else {
            if (err.message.includes('Signature mismatch')) {
              invalid_pin = true
              pin1 = ''
              pin2 = ''
            } else {
              $message = err.message
            }
          }
        })
      } else {
        let mnemonic
        if (reset_pin) {
          triplesec.decrypt({ data:triplesec.Buffer.from($em, 'hex'), key:triplesec.Buffer.from(pin) }, function (err, buff) {
            if (!err) {
              mnemonic = buff.toString()
              encrypt_mnemonic(mnemonic, pin2)
            } else {
              $message = err.message
            }
          })
        } else {
          mnemonic = generateMnemonic()
          encrypt_mnemonic(mnemonic, pin2)
        }
      }
    } else {
      $message = 'No storage available'
    }
  }

  function enter() {
    if (typeof(window.Storage)) {
      if (pin1 != '') {
        invalid_pin = false
        if ($em && !reset_pin) {
          pin2 = pin1
          loadMnemonic()
        } else {
          if (pin2 == '') {
            pin2 = pin1
            pin1 = ''
          } else if (pin1 == pin2) {
            loadMnemonic()
          } else {
            invalid_pin = true
            pin1 = ''
            pin2 = ''
          }
        }
      }
    } else {
      $message = 'No storage available'
    }
  }

  $: bullets = '* * * * * * * * * * * * * * * * * * * * '.substring(0, pin1.length*2)

  window.scrollTo(0,0)
</script>

<style>
  #number-pad td { padding:17px 30px; font-size:24px; font-weight:bold; border:1px solid #aaa; cursor:pointer; }
</style>

<div class="mt-6">
  {#if bullets != ''}
    <div class="font-bold">{bullets}</div>
  {:else if invalid_pin && pin1 == ''}
    <div class="text-red-700 whitespace-nowrap">Invalid PIN</div>
  {:else if typeof(window.Storage)}
    {#if $em && !reset_pin}
      {#if prepare}
        <div class="text-gray-600 whitespace-nowrap">First, enter your <b>current</b> PIN</div>
      {:else}
        <div class="text-gray-600 whitespace-nowrap">Enter your PIN</div>
      {/if}
    {:else}
      {#if pin2 != '' && pin1 == ''}
        {#if reset_pin}
          <div class="text-gray-600 whitespace-nowrap">Finally, enter your <b>new</b> PIN again</div>
        {:else}
          <div class="text-gray-600 whitespace-nowrap">Next, enter your PIN again</div>
        {/if}
      {:else}
        {#if reset_pin}
          <div class="text-gray-600 whitespace-nowrap">Now enter your <b>new</b> PIN</div>
        {:else}
          <div class="text-gray-600 whitespace-nowrap">First, enter your desired PIN</div>
        {/if}
      {/if}
    {/if}
  {:else}
    <div class="mt-16 text-gray-600 whitespace-nowrap">Error: Unsupported browser</div>
  {/if}
</div>

{#if typeof(window.Storage) != undefined}
  <table id="number-pad" class="bg-gray-200">
    <tr><td on:click={()=>pin1+='1'}>1</td><td on:click={()=>pin1+='2'}>2</td><td on:click={()=>pin1+='3'}>3</td></tr>
    <tr><td on:click={()=>pin1+='4'}>4</td><td on:click={()=>pin1+='5'}>5</td><td on:click={()=>pin1+='6'}>6</td></tr>
    <tr><td on:click={()=>pin1+='7'}>7</td><td on:click={()=>pin1+='8'}>8</td><td on:click={()=>pin1+='9'}>9</td></tr>
    <tr><td colspan="3" style="padding:0; font-size:16px;">
      <button class="w-1/2 bg-gray-100 text-lg font-semibold border-l-0 border-t-0 border-b-0 border-r border-gray-400 py-4 focus:outline-none" on:click={reset}>Reset</button><button class="w-1/2 bg-gray-100 text-lg font-semibold border-none py-4 focus:outline-none" on:click={enter}>Enter</button>
    </tr>
  </table>
{/if}
