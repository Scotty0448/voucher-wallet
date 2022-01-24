<script>
  import { addressFromSeed }  from './components/Utils.svelte'

  import Loading			from './components/Loading.svelte'
  import Empty				from './components/Empty.svelte'
  import List					from './components/List.svelte'
	import Receive			from './components/Receive.svelte'
	import Voucher			from './components/Voucher.svelte'
	import Authenticate	from './components/Authenticate.svelte'
  import Settings			from './components/Settings.svelte'
  import About			  from './components/About.svelte'
  import ResetPin			from './components/ResetPin.svelte'
  import ShowWords	  from './components/ShowWords.svelte'
  import ImportWords	from './components/ImportWords.svelte'

  import { onMount }  from 'svelte'

  import { coin, app_name, app_logo, network }                from './config.js'
  import { api_url, rdb_host, rdb_port, rdb_secure, rdb_db }  from './config.js'
  import { em }                                               from './local_stores.js'
  import { seed }                                             from './session_stores.js'
  import { address, view_stack, merchants, vouchers }         from './stores.js'

  $: view = $view_stack.slice(-1)

  function isEmpty(object) {
    return Object.keys(object).length === 0
  }

  async function goto(new_view) {
    if (new_view == 'list' || new_view == 'settings') {
      $view_stack=[new_view]
    } else {
      $view_stack=[...$view_stack, new_view]
    }
  }

  import rdb_ws_client from 'rethinkdb-websocket-client'
  let rdb = rdb_ws_client.rethinkdb

  function merchantOf(asset_name) {
    let parts = asset_name.split('/')
    parts.pop()
    return parts.join('/')
  }

  async function addMerchant(conn, merchant_name) {
    let merchant = await rdb.table('assets').get(merchant_name).run(conn)
    let info = merchant.info
    try { info = JSON.parse(info) } catch(err) {}
    $merchants[merchant_name] = info
    rdb.table('assets').get(merchant_name).changes().run(conn, (err, changes) => {
      changes.each((err, change) => {
        if (change) {
          try { change.new_val.info = JSON.parse(change.new_val.info) } catch(err) {}
          $merchants[merchant_name] = change.new_val.info
        }
      })
    })
  }

  function addVoucher(conn, voucher_name, confirmed, unconfirmed) {
    rdb.table('assets').get(voucher_name).run(conn, (err, voucher) => {
      let info = voucher.info
      try { info = JSON.parse(info) } catch(err) {}
      $vouchers[voucher_name] = {}
      $vouchers[voucher_name].title = info.title
      $vouchers[voucher_name].confirmed = confirmed
      $vouchers[voucher_name].unconfirmed = unconfirmed
      rdb.table('assets').get(voucher_name).changes().run(conn, (err, changes) => {
        changes.each((err, change) => {
          if (change) {
            try { change.new_val.info = JSON.parse(change.new_val.info) } catch(err) {}
            $vouchers[voucher_name].title = change.new_val.info.title
          }
        })
      })
    })
  }

  function syncWithDB(address) {
    if (!address) return
    rdb_ws_client.connect({host:rdb_host, port:rdb_port, path:'/', wsProtocols: ['binary'], secure:rdb_secure, db:rdb_db}).then((conn) => {
      rdb.table('balances').filter({ address:address }).run(conn, (err, cursor) => {
        cursor.toArray((err, balances) => {
          balances.forEach(async asset_balances => {
            let voucher_name = asset_balances.asset
            let merchant_name = merchantOf(voucher_name)
            if (!$merchants[merchant_name]) {
              await addMerchant(conn, merchant_name)
            }
            if (!$vouchers[voucher_name]) {
              addVoucher(conn, voucher_name, asset_balances.confirmed, asset_balances.unconfirmed)
            }
          })
        })
      })

      rdb.table('balances').filter({ address:address }).changes().run(conn, (err, changes) => {
        changes.each(async (err, change) => {
          if (change) {
            if (change.old_val == null) {
              let voucher_name = change.new_val.asset
              let merchant_name = merchantOf(voucher_name)
              if (!$merchants[merchant_name]) {
                await addMerchant(conn, merchant_name)
              }
              if (!$vouchers[voucher_name]) {
                addVoucher(conn, voucher_name, change.new_val.confirmed, change.new_val.unconfirmed)
              }
            } else {
              if (change.new_val != null) {
                let voucher_name = change.new_val.asset
                $vouchers[voucher_name].confirmed = change.new_val.confirmed
                $vouchers[voucher_name].unconfirmed = change.new_val.unconfirmed
              } else {
                let voucher_name = change.old_val.asset
                $vouchers[voucher_name].confirmed = 0
                $vouchers[voucher_name].unconfirmed = 0
              }
            }
          }
        })
      })

      rdb.table('info').get('blockcount').run(conn, (err, info) => {
				// console.log(info.value)
			})
			rdb.table('info').filter({ key:'blockcount' }).changes().run(conn, (err, changes) => {
				changes.each((err, change) => {
					if (change) {
						// console.log(change.new_val.value)
					}
				})
			})
    })
  }

  onMount(async function() {
    $address = addressFromSeed($seed, network)
  })

  $: syncWithDB($address)
</script>

<div class="max-h-screen max-w-md mx-auto border-l border-r border-gray-300  text-gray-800 flex flex-col relative">

  <div class="bg-gray-100 px-3 border-b border-gray-300">
    <div class="flex justify-between h-14">
        <div class="flex items-center">
          {#if app_logo}
            <img src="{app_logo}" class="cursor-pointer" style="height:34px" alt="" on:click="{()=>goto('list')}">
          {:else}
            <div class="text-gray-800 font-semibold text-lg ml-1 mt-1 cursor-pointer" on:click="{()=>goto('list')}">{app_name}</div>
          {/if}
        </div>
        {#if $em && $address}
          <div class="flex items-center space-x-2">
            <div class="text-green-600 cursor-pointer">
              <svg on:click="{()=>goto('receive')}" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </div>
            <div class="text-gray-500 cursor-pointer">
              <svg on:click="{()=>goto('settings')}" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
          </div>
        {/if}
    </div>
  </div>

  {#if $em && $address}

    <div class="bg-gray-200 px-3 min-h-screen">
      {#if false}
        <Loading />
      {:else if view == 'list'}
        {#if isEmpty($merchants)}
          <Empty />
        {:else}
          <List />
        {/if}
      {:else if view == 'receive'}
        <Receive />
      {:else if view == 'voucher'}
        <Voucher />
      {:else if view == 'settings'}
        <Settings />
      {:else if view == 'about'}
        <About />
      {:else if view == 'reset_pin'}
        <ResetPin />
      {:else if view == 'show_words'}
        <ShowWords />
      {:else if view == 'import_words'}
        <ImportWords />
      {/if}
    </div>

  {:else}

    <div class="h-screen bg-white flex flex-col items-center">
      <Authenticate />
    </div>

  {/if}

</div>
