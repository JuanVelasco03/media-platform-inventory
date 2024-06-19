export interface MediaPlatform {
  internComunication: MediaRow[];
  externComunication: MediaRow[];
  Marketing: MediaRow[];
}

export interface MediaRow {
  channel: string;
  characteristics: string;
  restrictions: string;
  periodicity: string;
  indicators: string;
  scope : string;
  topics: string;
  responsible: string;
}
