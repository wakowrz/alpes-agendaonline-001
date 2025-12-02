import { Doctor } from './doctor';

export interface Fecha {
  numDia: string;
  nomDia: string;
  fecha: string;
  mes: string;
  anno: string;
  doctor?: Doctor[];
}
