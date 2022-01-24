<script>
  import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx'
  import { onMount }        from 'svelte'
  import Modal              from './Modal.svelte'

  import { message }        from '../session_stores.js'

  export let recipient_address
  export let state

  let scanning = false
  let qrcode2
  let scanner
  let canvasElement
  let canvas
  let video

  function tick() {
    if (video) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
    }

    scanning && requestAnimationFrame(tick)
  }

  function scanVideo() {
    try {
      qrcode2.decode();
    } catch (e) {
      setTimeout(scanVideo, 300)
    }
  }

  function dismissScanner() {
    scanning = false

    video.srcObject.getTracks().forEach(track => {
      track.stop()
    });

    scanner.style.display = 'none'
  }

  function skipScan() {
    dismissScanner()
    recipient_address = ''
    state = 'confirm'
  }

  function cancelSend() {
    dismissScanner()
    state = ''
  }

  function pwaScan() {
    navigator.mediaDevices
      .getUserMedia({ audio:false, video:{facingMode:'environment'} })
      .then(function(stream) {
        scanning = true;
        scanner.style.display = 'block'
        video.setAttribute('playsinline', true) // required to tell iOS safari we don't want fullscreen
        video.srcObject = stream
        video.play()
        tick()
        scanVideo()
      })
      .catch(function(e) {
        if (!e.message.includes('denied permission')) {
          $message = e.message
        }
        state = 'confirm'
      })
  }

  onMount(async function() {
    BarcodeScanner.prototype.scan().then(barcodeData => {
      if (barcodeData['cancelled']==0) {
        recipient_address = barcodeData['text']
      } else {
        $message = ''
      }
    }).catch(err => {
      if (err == 'cordova_not_available') {
        pwaScan()
      } else {
        $message = err
      }
    });

    qrcode2 = window.qrcode
    scanner = document.getElementById('scanner')
    canvasElement = document.getElementById('qr-canvas')
    canvas = canvasElement.getContext('2d')

    qrcode2.callback = res => {
      if (res) {
        dismissScanner()
        recipient_address = res.replace(/rito:/g,'')
        state = 'confirm'
      }
    }
  })
</script>

<style>
  #scanner {
    margin:10px auto; padding:0;
    width:calc(100% - 20px);
    background:white;
    display:none;
  }
  #scanner #qr-canvas {
    width:100%; max-height:360px;
  }
</style>

<Modal on:modalClosed={dismissScanner}>
  <div class="text-sm m-2 text-center text-gray-800">
    Scan the QR code of the receiving wallet.<br><span class="text-xs">Or click Skip Scan to enter the address.</span>
  </div>
  <div id="scanner" class="w-full bg-white text-center">
    <video autoplay muted playsinline style="position:absolute;opacity:0;top:0;z-index:-1000" bind:this={video}></video>
    <canvas id="qr-canvas"></canvas>
    <button class="w-32 mt-4 mb-1 bg-gray-100 rounded font-medium border border-gray-300 py-1 px-4 text-sm focus:outline-none border:outline-none text-gray-800 mx-1" on:click={skipScan}>Skip Scan</button>
    <button class="w-32 mt-4 mb-1 bg-gray-100 rounded font-medium border border-gray-300 py-1 px-4 text-sm focus:outline-none border:outline-none text-gray-800 mx-1" on:click={cancelSend}>Cancel Send</button>
  </div>
</Modal>
