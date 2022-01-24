<script>
  import Spinner from './Spinner.svelte'

  import { view_stack, merchants, vouchers, selectedVoucherName }  from '../stores.js'

  function merchantOf(voucher_name) {
    let parts = voucher_name.split('/')
    parts.pop()
    return parts.join('/')
  }

  function selectVoucher(voucher_name) {
    $selectedVoucherName = voucher_name
    $view_stack = [...$view_stack, 'voucher']
  }
</script>

<div class="mt-4">
  <ul class="grid grid-cols-1 gap-4">
    {#each Object.keys($vouchers).sort() as voucher_name}
      {#if $vouchers[voucher_name].confirmed > 0 || $vouchers[voucher_name].unconfirmed > 0}
        <li class="col-span-1 flex shadow-sm rounded-md cursor-pointer relative" on:click="{()=>selectVoucher(voucher_name)}">
          {#if $vouchers[voucher_name].unconfirmed != 0}
            <div class="absolute top-px right-1">
              <div class="pt-0.5"><Spinner color="#047857" /></div>
            </div>
          {:else if $vouchers[voucher_name].confirmed > 1}
            <div class="absolute top-px right-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {$vouchers[voucher_name].confirmed}
              </span>
            </div>
          {/if}
          <div class="flex-shrink-0 flex items-center justify-center w-16 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-l-md">
            <img class="h-10 w-auto" src="{$merchants[merchantOf(voucher_name)].logo}" alt="">
          </div>
          <div class="flex-1 flex items-center justify-between border-t border-r border-b border-gray-300 bg-white rounded-r-md truncate">
            <div class="flex-1 px-4 py-2 text-sm truncate">
              <p class="text-gray-900 font-medium hover:text-gray-600 truncate">{$merchants[merchantOf(voucher_name)].name}</p>
              <p class="text-gray-900 font-light truncate">{$vouchers[voucher_name].title}</p>
            </div>
          </div>
        </li>
      {/if}
    {/each}
  </ul>
</div>
