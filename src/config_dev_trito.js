export const coin = 'trito'
export const network = {
  messagePrefix: '\x15Rito Signed Message:\n',
  bech32: null,
  bip32: {
    public: 0x43587CD,
    private: 0x4358391,
  },
  pubKeyHash: 0x6F,
  scriptHash: 0xC4,
  wif: 0xEF
}

export const app_name = 'Voucher Wallet'

export const api_url = 'https://api.chaintek.net'

export const rdb_host = 'wss.rethinkdb.chaintek.net'
export const rdb_port = 443
export const rdb_secure = true
// export const rdb_host = 'localhost'
// export const rdb_port = 8014
// export const rdb_secure = false
export const rdb_db = 'trito'
