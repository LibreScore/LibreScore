
import crypto from 'libp2p-crypto'

export interface Identity {
  publicKey (): Promise<crypto.PublicKey>;
  sign (data: Buffer): Promise<Buffer>;
}
