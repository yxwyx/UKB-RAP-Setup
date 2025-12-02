export interface GeneratedFile {
  filename: string;
  language: string;
  content: string;
  description: string;
}

export interface SetupConfig {
  goal: string;
  packages: string;
  rVersion: string;
  includeBioconductor: boolean;
  includeTidyverse: boolean;
}

export enum GeneratorStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}