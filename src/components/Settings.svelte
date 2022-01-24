<script>
  import { app_name }   from '../config.js'
  import { view_stack } from '../stores.js'

  function goto(view) {
    $view_stack = [...$view_stack, view]
  }
</script>

<div class="h-screen -mx-3 p-3 bg-gray-200">
  <div class="mt-1 space-y-3 text-black">
    <div class="group flex items-center px-3 py-2 text-base font-medium text-blue-800 border border-gray-300 rounded-md bg-white cursor-pointer" on:click="{()=>goto('about')}">
      <span class="truncate">
        About {app_name}
      </span>
    </div>

    <div class="group flex items-center px-3 py-2 text-base font-medium text-blue-800 border border-gray-300 rounded-md bg-white cursor-pointer" on:click="{()=>goto('reset_pin')}">
      <span class="truncate">
        Reset PIN
      </span>
    </div>

    <div class="group flex items-center px-3 py-2 text-base font-medium text-blue-800 border border-gray-300 rounded-md bg-white cursor-pointer" on:click="{()=>goto('show_words')}">
      <span class="truncate">
        Show Recovery Words
      </span>
    </div>

    <div class="group flex items-center px-3 py-2 text-base font-medium text-blue-800 border border-gray-300 rounded-md bg-white cursor-pointer" on:click="{()=>goto('import_words')}">
      <span class="truncate">
        Import Recovery Words
      </span>
    </div>
  </div>
</div>
