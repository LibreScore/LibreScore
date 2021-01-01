
import { UserPubKeyType } from '@/identity'

export interface IndexingInfo {

  /**
   * repo address
   */
  _repo: string;

  /**
   * unique identifier of this score in the indexing repo  
   * to handle revisions
   */
  _id: string;

  /**
   * public key of the score uploader 
   */
  _uploader?: UserPubKeyType;

  /**
   * entry signature by the uploader
   * 
   * repo internal use only
   */
  _sig?: Buffer;

  /** 
   * cid reference to the scorepack  
   * It also indicates the score revision.
   */
  scorepack: string;
  /**
   * cid to the thumbnail image
   */
  thumbnail: string;

  title: string;

  /**
   * duration in seconds 
   */
  duration: number;

  /**
   * number of pages in this score
   */
  npages?: number;

  /**
   * number of parts in this score
   */
  nparts?: number;

  /**
   * MusicXML instruments
   */
  instruments?: string[];

  /**
   * updated time
   * use the time from the scorepack
   * 
   * seconds of UTC time since Unix epoch
   */
  updated: number;
  created?: number;

}
