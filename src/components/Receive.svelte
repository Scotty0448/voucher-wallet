<script>
  import Modal          from './Modal.svelte';
	import { onMount } 		from 'svelte'
	import { toDataURL }  from 'qrcode-lite'

  import { address }    from '../stores.js'
  import { network }    from '../stores.js'

	let prompt = ''

	function updateImages() {
		if (document.getElementById('qrcode') && document.getElementById('clipboard')) {
			toDataURL($address, {type:'image/png'}).then(url => {
				document.getElementById('qrcode').src = url
			})
			document.getElementById('clipboard').src = 'images/copy.png'
		}
	}

	onMount(async () => {
		updateImages()
    window.scrollTo(0,0)
  })

  function copyToClipboard() {
    var el = document.createElement('textarea');
    el.value = $address;
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    document.getElementById('clipboard').src = 'images/copied.png'
		document.getElementById('clipboard_label').innerHTML = 'Copied'
  }
</script>

<Modal>
  <div class="text-sm mt-4 text-center text-gray-800">
    This is the QR code for your receiving address.<br><span class="text-xs">Allow a sender to scan it or copy it as text.</span>
  </div>
  <div class="text-center text-gray-800">
    <img id="qrcode" class="mx-auto" alt="">
  	<div class="text-xs sm:text-sm">{$address}</div>
  	<div class="w-32 mx-auto flex justify-around">
  		<div class="w-16 text-center cursor-pointer flex flex-col items-center" on:click={copyToClipboard}>
    		<img id="clipboard" class="mt-2" src="copy.png" alt="">
  			<div id="clipboard_label" class="text-xs text-gray-800">Copy</div>
  		</div>
  	</div>
  	<div class="mt-4 mb-3 text-blue-700 text-xs">{@html prompt}</div>
  </div>
</Modal>
