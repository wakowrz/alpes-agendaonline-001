import { BASE } from 'src/environments/environment';

export class Constants {
  /**
   * Returns an object with regulars expressions
   */
  public getRegularExp() {
    return this.regularExpressions;
  }
  /**
   * Returns an object with messages alerts
   */
  public getAlertMessages() {
    return this.alertMessages;
  }

  private regularExpressions = {
    /**
     * Expression for 'Rut'
     */
    rut: /^0*(\d{1,3}(\.?\d{3})*)\-?([\dkK])$/,
    /**
     * Expression for 'Email'
     */
    email: /[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}/,
  };

  private alertMessages = {
    success: 'Bien!',
    error: 'Error',
    info: 'Info',
    add: 'Agregar',
    edit: 'Editar',
    addDescription: 'Registro almacenado con éxito',
    editDescription: 'Se han realizado los cambios exitosamente',
    annulDescription: 'tu reserva se ha anulado con éxito',
    errorDescription:
      'Hubo un error al realizar la operación, intente más tarde',
    confirmAnnul: '¿Seguro que deseas anular tu reserva',
    confirmSchedule: '',
    loading: 'Cargando...',
    accept: 'Aceptar',
  };
}

export const apiRequest = {
  /**
   * Get que trae las especialidades con los tratamientos del JSON estático.
   */
  getSpecialties: BASE.bff + 'getSpecialties',

  /**
   * Get que trae todos los dentistas activos.
   */
  getDentists: BASE.bff + 'getDentists',
  /**
   * Post con nombre GET, se debe enviar un JSON con id_dentista, id_especialidad,
   * nombre_especialidad, time y detalle_especialdiad, como respuesta trae un arreglo con la sucursal
   */
  getDentistOffices: BASE.bff + 'getDentistOffice',

  /**
   * Post con nombre GET, debe enviar un JSON con la especialidad escogida y los todos los doctores,
   * como respuesta trae un arreglo con las sucursales y los doctores de la especialidad seleccionada
   */
  getOffices: BASE.bff + 'getOffices', //este es un post con nombre GET, debe enviar objeto

  /**
   * Post con nombre GET, se debe enviar un JSON con id sucursal, id especialidad,
   * id tratamiento escogidos, como respuesta trae un arreglo con los horarios
   * disponibles de cada doctor que atiende en la sucursal seleccionada
   */
  getDentistsHoras: BASE.bff + 'getDentistsHoras', //este es un post con nombre GET
  /**
   * Post con nombre de GET. Se debe enviar el rut de la persona.Trae la información de los usuarios
   */
  //getUserAppointments
  getUserAppointment: BASE.bff + 'getUserAppointment', //este es un post con nombre GET
  getUserInfo: BASE.bff + 'getUserInfo', //este es un post con nombre GET

  /**
   * Trae la agenda del dentista
   */
  getDentistSchedule: BASE.bff + 'getDentistSchedule',

  /**
   * PUT para anular cita
   */
  cancelAppointment: BASE.bff + 'cancelAppointment',

  /**
   * POST que obtiene la agenda del dentista seleccionado
   */
  getScheduleByDentist: BASE.bff + 'getScheduleByDentist',
  /**
   * Registra un paciente
   */
  insertPatient: BASE.bff + 'insertPatient',
  /**
   *Registra una cita
   */
  insertAppointment: BASE.bff + 'insertAppointment',

  rescheduleAppointment: BASE.bff + 'rescheduleAppointment',
  /**
   * Actualizar info usuario
   */
  updateInfoPatient: BASE.bff + 'updateInfoPatient',
  /**
   * Nuevo servicio para obtener id operacion. es un post url + objeto
   */
  optId: BASE.bff + 'getOperationId',
};

export const appointmentInfoBySpecialty = [];
export const appointmentInfoByDentist = [];
