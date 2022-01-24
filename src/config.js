export const coin = 'rito'
export const network = {
  messagePrefix: '\x15Rito Signed Message:\n',
  bech32: null,
  bip32: {
    public: 0x0534E7CA,
    private: 0x05347EAC,
  },
  pubKeyHash: 0x19,
  scriptHash: 0x69,
  wif: 0x8B
}

export const app_name = 'TokenTrade'
export const app_logo = 'images/TT_Logo2.png'

export const api_url = 'https://api.chaintek.net'

export const rdb_host = 'wss.rethinkdb.chaintek.net'
export const rdb_port = 443
export const rdb_secure = true
export const rdb_db = 'rito'
