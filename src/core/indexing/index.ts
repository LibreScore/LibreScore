
export interface IndexingInfo {

  /** 
   * cid reference to the scorepack
   */
  scorepack: string;
  /**
   * cid to the thumbnail image
   */
  thumbnail?: string;

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
   * updated time
   * use the time from the scorepack
   * 
   * seconds of UTC time since Unix epoch
   */
  updated: number;
  created?: number;

}
