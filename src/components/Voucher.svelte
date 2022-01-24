<script>
  import { onMount, onDestroy } from 'svelte'

  import Modal        from './Modal.svelte'
  import Authenticate	from './Authenticate.svelte'
  import Scanner      from './Scanner.svelte'
  import Spinner      from './Spinner.svelte'

  import { coin, network, api_url }                                         from '../config.js'
  import { seed, message }                                                  from '../session_stores.js'
  import { address, view_stack, merchants, vouchers, selectedVoucherName }  from '../stores.js'

  const bitcoin = require('bitcoinjs-lib')
  import Buffer   from 'buffer/'
  import reverse  from 'buffer-reverse'

  let recipient_address = ''
  let qty = 1
  let max_qty
  let state = ''
  let destroyed = false
  let interval_id

  $: view = $view_stack.slice(-1)
  $: merchant = $merchants[merchantOf($selectedVoucherName)]
  $: voucher = $vouchers[$selectedVoucherName]

  function merchantOf(asset_name) {
    let parts = asset_name.split('/')
    parts.pop()
    return parts.join('/')
  }

	onMount(async () => {
    $message = ''
    window.scrollTo(0,0)
    max_qty = voucher.confirmed
  })

  onDestroy(async () => {
    clearInterval(interval_id)
    destroyed = true
  })

  async function signTx(coin, network, sender_address, rawtx) {
    try {
      let txFromHex = bitcoin.Transaction.fromHex(rawtx)
      let txb = bitcoin.TransactionBuilder.fromTransaction(txFromHex, network)

      for (let [idx, input] of txFromHex.ins.entries()) {
        let txid = reverse(input.hash).toString('hex')
        let txout_resp = await fetch(`${api_url}/gettxout?coin=${coin}&txid=${txid}&index=${input.index}`)
        let txout = await txout_resp.json()
        if (txout.scriptPubKey.addresses[0] == sender_address) {
          if (txout.scriptPubKey.type == 'new_asset' || txout.scriptPubKey.type == 'reissue_asset' || txout.scriptPubKey.type == 'transfer_asset') {
            txb.__TX.ins[idx].assetScript = Buffer.Buffer.from(txout.scriptPubKey.hex, 'hex')
          }
          let master = bitcoin.bip32.fromSeed(Buffer.Buffer.from($seed, 'hex'), network)
          let child_node = master.derivePath("m/44'/19169'/0'/0/0")
          let keypair = bitcoin.ECPair.fromWIF(child_node.toWIF(), network)
          txb.sign(idx, keypair)
        }
      }
      let signedTx = txb.build().toHex()
      return {status:'signed', signedTx:signedTx}
    } catch (err) {
      $message = err.message
      return {status:'error', message:err.message}
    }

    /// updated bitcoinjs-lib/src/transaction_builder.js as follows:
    /// added "tx.ins[vin]," param to prepareInput call
    /// added ",inp" param to prepareInput function
    /// changed "const prevOutScript = payments.p2pkh({ pubkey: ourPubKey }).output;" to "const prevOutScript = (inp.assetScript != undefined) ? inp.assetScript : payments.p2pkh({ pubkey: ourPubKey }).output;"
  }

  async function sendVoucher(asset_name, qty, recipient_address) {
    let resp = await fetch(`${api_url}/sendAssetSubsidized`, {
      headers: { 'Content-Type':'application/json' },
      method: 'POST',
      body: JSON.stringify({
        coin              : coin,
        name              : asset_name,
        qty               : qty,
        sender_address    : $address,
        recipient_address : recipient_address
      })
    })
    let result = await resp.json()
    if (result.status == 'error') {
      if (result.message && result.message.startsWith("Invalid Rito address")) {
        $message = 'Invalid address'
      } else if (result.message && result.message.startsWith("Cannot read property 'scriptPubKey' of null")) {
        $message = 'Insufficient quantity available'
      } else if (result.message) {
        $message = result.message
      } else {
        $message = "Unknown error"
      }
      return
    }
    let result2 = await signTx(coin, network, $address, result.rawtx)
    if (result2.status == 'error') {
      $message = result2.message
      return
    }
    let resp2 = await fetch(`${api_url}/sendrawtx`, {
      headers: { 'Content-Type':'application/json' },
      method: 'POST',
      body: JSON.stringify({
        coin : coin,
        rawtx: result2.signedTx
      })
    })
    let txid = await resp2.text()
    if (txid == 'Error') {
      $message = "Error signing transaction"
      return
    }

    state = 'wait'
    $message = 'Waiting for blockchain confirmation'
    interval_id = setInterval(async () => {
      let resp = await fetch(`${api_url}/getmempoolentry?coin=${coin}&txid=${txid}`)
      let result = await resp.json()
      if (result.status == 'error') {
        clearInterval(interval_id)
        if (!destroyed) {
          $view_stack = ['list']
        }
      }
    }, 3000)
  }

  function scan() {
    if (state != 'wait') {
      $message =  ''
      state = 'scan'
    }
  }

  function cancel() {
    if (state != 'wait') {
      $message =  ''
      state = ''
    }
  }

  function send() {
    if (state != 'wait') {
      $message =  ''
      if (recipient_address != '') {
        let q = Number(qty)
        if (!isNaN(q) && q >= 1 && q <= max_qty && (q % 1 === 0)) {
          sendVoucher($selectedVoucherName, q, recipient_address)
        } else {
          $message = `Quantity must be a whole number between 1 and ${max_qty}`
        }
      } else {
        $message = 'No recipient address'
      }
    }
  }
</script>

{#if state == 'scan'}
  {#if $seed}
    <Scanner bind:recipient_address={recipient_address} bind:state={state} />
  {:else}
    <Modal>
      <div class="bg-white flex flex-col items-center pb-8">
        <Authenticate />
      </div>
    </Modal>
  {/if}
{:else if state == 'confirm' || state == 'wait'}
  {#if merchant && voucher}
    <Modal>
      <div class="flex flex-col items-center py-4 px-2">
        <div><img class="h-12 w-auto" src="{merchant.logo}" alt=""></div>
        <div class="mt-4 text-xs sm:text-md font-semibold text-gray-900">{merchant.name}</div>

        <div class="mt-6 text-md w-full border-t border-b border-gray-300 py-4 text-center text-gray-800 font-semibold">{voucher.title}</div>

        <div class="mt-8 text-center" style="width:276px">
          <div class="text-xs text-gray-600">Recipient Address</div>
          <input type="text" class="text-xs px-2 py-1 shadow-none w-full" bind:value={recipient_address}>
        </div>

        {#if max_qty > 1}
          <div class="mt-3 text-center" style="width:276px">
            <div class="text-xs text-gray-600">Quantity</div>
            <input type="number" min="1" max="{max_qty}" class="text-xs px-2 py-1 shadow-none" style="width:49px" bind:value={qty}>
          </div>
        {/if}

        <div class="mt-6 mb-2 inline-flex items-center">
          <button disabled="{state == 'wait'}" on:click={send} class="w-24 mx-2 px-4 py-1 bg-green-600 rounded text-white font-semibold text-sm border border-transparent hover:bg-green-700 focus:outline-none border:outline-none inline-flex items-center justify-center">
            <div class="pr-2" hidden="{state != 'wait'}"><Spinner color="white" /></div>
            Send
          </button>
          <button disabled="{state == 'wait'}" on:click={cancel} class="w-24 mx-2 px-4 py-1 bg-gray-100 rounded text-gray-800 font-medium text-sm border border-gray-300 hover:bg-gray-200 focus:outline-none border:outline-none">Cancel</button>
        </div>

        {#if $message != ''}
          <div class="text-xs text-red-700 mt-4">
            {$message}
          </div>
        {/if}
      </div>
    </Modal>
  {/if}
{:else}
  {#if merchant && voucher}
    <Modal>
      <div class="flex flex-col items-center pt-4 mb-1 px-2">
        {#if merchant}
          {#if merchant.logo}<div><img class="h-20 w-auto" src="{merchant.logo}" alt=""></div>{/if}
        	{#if merchant.name}<div class="mt-6 text-sm sm:text-md font-semibold text-gray-900">{merchant.name}</div>{/if}
          {#if merchant.address1}<div class="mt-2 text-xs text-gray-900 whitespace-nowrap">{merchant.address1}</div>{/if}
          {#if merchant.address2}<div class="mt-px text-xs text-gray-900 whitespace-nowrap">{merchant.address2}</div>{/if}
          {#if merchant.phone}<div class="mt-px text-xs text-gray-900 whitespace-nowrap">{merchant.phone}</div>{/if}
        {/if}

        {#if voucher}
          <div class="mt-8 mb-6 text-md w-full border-t border-b border-gray-300 py-4 text-center text-gray-800 font-semibold">{voucher.title}</div>
        {/if}

        <button class="mt-1 px-6 py-1 rounded text-white font-semibold text-sm border border-transparent bg-green-600 shadow-sm hover:bg-green-700 focus:outline-none border:outline-none" on:click={scan}>Send</button>
      </div>
      <div class="text-gray-400 px-2 mb-1" style="font-size:10px">{$selectedVoucherName}</div>
    </Modal>
  {/if}
{/if}
