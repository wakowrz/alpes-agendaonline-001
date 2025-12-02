import { Hora } from './hora';

export interface Doctor {
  idDentista: number;
  nombre: string;
  time: number;
  idEspecialidad: string;
  nombreEspecialidad: string;
  detalleEspecialidad: string;
  idSucursal: number;
  direccion: string;
  listHora?: Hora[];
  idPaciente: string;
  fecha: string;
  am: boolean;
  pm: boolean;
}
