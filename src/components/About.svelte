<script>
  import { app_name } from '../config.js'
  import Modal from './Modal.svelte'
</script>

<Modal>
  <div class="text-gray-600 text-sm p-3">
    <p class="font-semibold">About {app_name}</p>
    <p class="mt-2 hidden">
      Voucher Wallet is an unbranded demo application using the Ritocoin testnet. It demostrates the use of Ritocoin assets as vouchers that can be received, held and transferred to others.
    </p>
    <p class="mt-2 hidden">
      Wallet security is derived from the use of the Ritocoin blockchain, recovery words, PIN-based access and cryptography in general. Wallet conveniences such as QR code reading and being able to complete transactions without holding the RITO currency itself are demonstrated.
    </p>
  </div>
</Modal>
