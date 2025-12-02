import { Fecha } from './fecha';

export interface Currucel {
  mesInicio: string;
  mesFinal: string;
  annoIncio: string;
  annoFinal: string;
  diaIncio: string;
  diaFinal: string;
  fecha?: Fecha[];
}
