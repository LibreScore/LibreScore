
import ScorePack from '@/core/scorepack'
import * as PublicKey from '@/core/pubkey'

export interface UserProfile {
  avatar?: string;
  name: string;
  url?: string;
}

export class NameProvider {
  /**
   * @todo
   */
  async lookup (): Promise<UserProfile | undefined> {
    return Promise.resolve(undefined)
  }
}

/**
 * https://github.com/musescore/MuseScore/blob/master/mscore/data/mscore.png
 */
const MUSESCORE_LOGO_URL = 'https://ipfs.io/ipfs/QmUk8LqPMvsTJi9WBic8tk6n8Ywfr76QfFicuXozXtCXHP'

/**
 * @todo
 */
export const resolveUserProfile = async (scorepack: ScorePack): Promise<UserProfile | undefined> => {
  const fromMuseScore = scorepack.source?.find((s) => s.name === 'musescore')
  if (fromMuseScore) { // the scorepack was uploaded by the MuseScore synchronizer
    return {
      avatar: MUSESCORE_LOGO_URL,
      name: 'MuseScore Sync',
      url: fromMuseScore.url,
    }
  }

  if (scorepack._sig) { // generate user display name with the public key id (hash digest)
    const pubKey = PublicKey.unmarshal(scorepack._sig.publicKey)
    const keyid = await PublicKey.shortId(pubKey)
    return {
      name: keyid,
    }
  }
}
