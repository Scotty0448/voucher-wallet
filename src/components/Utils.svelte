<script context="module">
  const bip39   = require('bip39')
  const bitcoin = require('bitcoinjs-lib')

  import Buffer from 'buffer/'

  export function generateMnemonic() {
    return bip39.generateMnemonic()
  }

  export function validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic)
  }

  export function seedFromMnemonic(mnemonic) {
    return bip39.mnemonicToSeedSync(mnemonic).toString('hex')
  }

  export function addressFromSeed(seed, network) {
    let path = "m/44'/19169'/0'/0/0"
    let master = bitcoin.bip32.fromSeed(Buffer.Buffer.from(seed, 'hex'), network)
    let child = master.derivePath(path)
    return bitcoin.payments.p2pkh({ pubkey:child.publicKey, network:network }).address
  }
</script>
