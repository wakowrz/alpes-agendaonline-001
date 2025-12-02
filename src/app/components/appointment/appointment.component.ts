import { Component, OnInit, Injectable } from '@angular/core';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { UtilService } from 'src/app/services/util.service';
import { Subscription } from 'rxjs';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import { apiRequest } from 'src/app/shared/constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageCallsService } from 'src/app/services/manage-calls.service';
import Swal from 'sweetalert2';
import { Fecha } from 'src/app/interfaces/fecha';

import * as moment from 'moment';
import 'moment/locale/es';
import { Doctor } from '../../interfaces/doctor';
import { Hora } from 'src/app/interfaces/hora';
import { Currucel } from 'src/app/interfaces/carrucel';
import { text } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent implements OnInit {
  faCalendar = faCalendar;
  public fechaAnterior: string = '';
  public siguienteFechaDisponible = '';
  public horaAnterior: string = '';
  public subscription: Subscription;
  listCarruel: Currucel[] = [];
  listFecha: Fecha[] = [];
  selectItem = 0;
  daySelect = '';
  listAgendaSelect: Doctor[] = [];
  horaSelection: Hora = {} as Hora;
  offices = [];
  officesCercanas = [];
  objectToSend = {};
  idCita = {};
  typeBusq: number;
  rutEnd = '';
  imgEspecialidad = '';
  isLoaded: boolean = false;

  constructor(
    private utSV: UtilService,
    private mngSV: ManageCallsService,
    private spinner: NgxSpinnerService,
    private data: DataServiceComponent
  ) {}

  ngOnInit(): void {
    this.loadInfo();
    this.selectItem = 0;
  }

  loadInfo() {
    this.officesCercanas = [];
    if (localStorage.getItem('objectToSend') != null) {
      let rsInfo = localStorage.getItem('objectToSend');
      this.objectToSend = JSON.parse(rsInfo);
      this.imgEspecialidad = this.objectToSend['urlImg'];
    }

    let listReserva;
    if (localStorage.getItem('datos') != null) {
      let rsInfo = localStorage.getItem('datos');
      listReserva = JSON.parse(rsInfo);
    }

    if (localStorage.getItem('office') != null) {
      let rsInfo = localStorage.getItem('office');
      this.offices = JSON.parse(rsInfo);
    }

    if (localStorage.getItem('typeBusq') != null) {
      this.typeBusq = parseInt(localStorage.getItem('typeBusq'));
    }

    if (this.typeBusq == 1) {
      const current = this.offices.find(
        (element) => element.id_sucursal === this.objectToSend['id_sucursal']
      );
      let toArray = current.id_proxima.split(',');
      if (toArray.length != 1) {
        this.serverPostOffOto(this.offices, listReserva);
      } else {
        let objCurrucel = {
          id: current.id_sucursal,
          sucursal: current.nombre_sucursal,
          disponible: true,
        };
        this.officesCercanas.push(objCurrucel);

        this.initSucursal(listReserva);
      }
    } else if (this.typeBusq == 2) {
      this.serverPostOffOtoDoct(this.offices, listReserva);
    } else {
      let objCurrucel = {
        id: this.offices[0].id_sucursal,
        sucursal: this.offices[0].sucursal,
        disponible: true,
      };

      this.officesCercanas.push(objCurrucel);

      this.initSucursal(listReserva);
    }
  }

  initSucursal(listReserva) {
    this.spinner.show();
    this.daySelect = '';
    this.listFecha = [];
    this.listCarruel = [];
    this.listAgendaSelect = [];

    if (localStorage.getItem('id_cita') != null) {
      let rsInfo = localStorage.getItem('id_cita');
      this.idCita = JSON.parse(rsInfo);
    }

    if (localStorage.getItem('sumDayNext') == null) {
      localStorage.setItem('sumDayNext', '1');
    }

    if (localStorage.getItem('Rut') != null) {
      this.rutEnd = localStorage.getItem('Rut');
    }

    var dt = moment(this.objectToSend['fecha_inicio'], 'YYYY-MM-DD HH:mm:ss');

    for (let i = 0; i < 14; i++) {
      let todaySum = '';
      let day = '';
      let nameDay = '';
      let mes = '';
      let anno = '';
      if (i == 0) {
        todaySum = moment(dt).format('YYYY-MM-DD');
        day = moment(dt).format('DD');
        nameDay = dt.format('dddd');
        mes = dt.format('MMMM');
        anno = dt.format('YYYY');
      } else {
        todaySum = moment(dt).add(i, 'days').format('YYYY-MM-DD');
        day = moment(dt).add(i, 'days').format('DD');
        nameDay = moment(dt).add(i, 'days').format('dddd');
        mes = moment(dt).add(i, 'days').format('MMMM');
        anno = moment(dt).add(i, 'days').format('YYYY');
      }

      var fstChar1 = nameDay.charAt(0).toUpperCase();
      var fstChar2 = nameDay.charAt(1).toUpperCase();
      var fstChar = fstChar1 + '' + fstChar2;
      let fecha: Fecha = {
        numDia: day,
        nomDia: fstChar,
        fecha: todaySum,
        mes: this.capitalize(mes),
        anno: anno,
        doctor: [],
      };
      this.listFecha.push(fecha);
    }

    var listInstCarr = [];
    let i = 0;
    let dayCarrucel = '';
    let mesCarrucel = '';
    let annoCarrucel = '';
    for (let infoFecha in this.listFecha) {
      for (let valor in listReserva) {
        const current = listReserva[valor].horas_disponibles.find(
          (element) => element.fecha === this.listFecha[infoFecha].fecha
        );

        if (current != null) {
          let horas_disponibles = listReserva[valor].horas_disponibles;
          for (let infoHora in horas_disponibles) {
            if (
              horas_disponibles[infoHora].fecha ===
              this.listFecha[infoFecha].fecha
            ) {
              if (horas_disponibles[infoHora].length != 0) {
                let listHora: Hora[] = [];
                let hora = horas_disponibles[infoHora].horas;
                let am = false;
                let pm = false;
                for (let infoHoraEnd in hora) {
                  let horaActual = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
                  let horaIngreso = moment(
                    this.listFecha[infoFecha].fecha + ' ' + hora[infoHoraEnd],
                    'YYYY-MM-DD HH:mm:ss'
                  );

                  if (horaActual < horaIngreso) {
                    let tipeInfo = moment(hora[infoHoraEnd], 'HH:mm').format(
                      'HH:mm A'
                    );

                    if (tipeInfo.includes('PM')) {
                      tipeInfo = 'PM';
                      pm = true;
                    } else {
                      tipeInfo = 'AM';
                      am = true;
                    }
                    let objHora: Hora = {
                      hora: hora[infoHoraEnd],
                      type: tipeInfo,
                      idDentista: listReserva[valor].id_dentista,
                      idSucursal: listReserva[valor].id_sucursal,
                      idPaciente: this.rutEnd,
                      fecha: horas_disponibles[infoHora].fecha,
                      sucursal: listReserva[valor].sucursal,
                      duracion: listReserva[valor].time,
                      nombre: listReserva[valor].nombre,
                      nombreEspecialidad:
                        listReserva[valor].nombre_especialidad,
                      detalleEspecialidad:
                        listReserva[valor].detalle_especialidad,
                    };

                    listHora.push(objHora);
                  }
                }

                if (listHora.length != 0) {
                  let objDoctor: Doctor = {
                    idDentista: listReserva[valor].id_dentista,
                    nombre: listReserva[valor].nombre,
                    time: listReserva[valor].time,
                    idEspecialidad: listReserva[valor].id_especialidad,
                    nombreEspecialidad: listReserva[valor].nombre_especialidad,
                    detalleEspecialidad:
                      listReserva[valor].detalle_especialidad,
                    idSucursal: listReserva[valor].id_sucursal,
                    direccion: listReserva[valor].direccion,
                    listHora: listHora,
                    idPaciente: this.rutEnd,
                    fecha: horas_disponibles[infoHora].fecha,
                    am: am,
                    pm: pm,
                  };

                  this.listFecha[infoFecha].doctor.push(objDoctor);
                }
              }
            }
          }
        }
      }

      listInstCarr.push(this.listFecha[infoFecha]);

      if (i == 0) {
        dayCarrucel = this.listFecha[infoFecha].numDia;
        mesCarrucel = this.listFecha[infoFecha].mes;
        annoCarrucel = this.listFecha[infoFecha].anno;
        i++;
      } else if (i == 6) {
        let objCurrucel: Currucel = {
          mesInicio: mesCarrucel,
          mesFinal: this.listFecha[infoFecha].mes,
          annoIncio: annoCarrucel,
          annoFinal: this.listFecha[infoFecha].anno,
          diaIncio: dayCarrucel,
          diaFinal: this.listFecha[infoFecha].numDia,
          fecha: listInstCarr,
        };

        this.listCarruel.push(objCurrucel);
        listInstCarr = [];
        i = 0;
      } else {
        i++;
      }
    }

    this.listCarruel.forEach((element) => {
      element.fecha.forEach((element) => {
        if (element.doctor.length != 0) {
          this.siguienteFechaDisponible != ''
            ? ''
            : (this.siguienteFechaDisponible = element.fecha);
        }
      });
    });
    try {
      this.siguienteFechaDisponible != ''
        ? this.daySelectButton(this.siguienteFechaDisponible)
        : '';
    } catch (error) {}
    this.spinner.hide();
    this.isLoaded = true;
  }
  lineCounter(agenda, oficinas) {
    let newAgenda = agenda.filter((a) => {
      return a.idSucursal === oficinas.id;
    });
    return newAgenda[0].idDentista;
  }
  ngAfterViewChecked() {
    try {
      document.getElementById(this.siguienteFechaDisponible).className =
        'btn-custom-badge-2-selected';
      this.siguienteFechaDisponible != ''
        ? this.daySelectButton(this.siguienteFechaDisponible)
        : '';
      this.isLoaded = true;
    } catch (error) {}
  }
  capitalize(word) {
    return word[0].toUpperCase() + word.slice(1);
  }

  getInfoOfMessage(message) {
    const especialidad = message.especialidad;
  }

  SwalAlert(message) {
    Swal.fire({
      title: `No se han encontrado horas disponibles en la sucursal ${message.sucursal}`,
      icon: 'warning',
      iconColor: '#f9a825',
      showDenyButton: true,
      denyButtonText: `Volver`,
      denyButtonColor: '#072d69',
      confirmButtonText: 'Buscar en otras sucursales',
      confirmButtonColor: '#f9a825',
    }).then((result) => {
      if (result.isConfirmed) {
        this.findDateAnyWhere();
      } else if (result.isDenied) {
        this.navigate('/home');
      }
    });
  }

  ngOnDestroy() {}

  findDateAnyWhere() {}

  public navigate(path: string) {
    if (this.horaSelection.fecha != null) {
      if (this.idCita['id_cita'] != null) {
        this.horaSelection.idCita = this.idCita['id_cita'];
      } else {
        this.horaSelection.idCita = 0;
      }

      localStorage.setItem('SelectHora', JSON.stringify(this.horaSelection));
      this.utSV.navigateToPath(path);
    }
  }

  selectHora(objHora: Hora) {
    this.horaSelection = objHora;
    this.horaAnterior === ''
      ? ''
      : (document.getElementById(this.horaAnterior).className =
          'btn-custom-badge badge');
    document.getElementById(objHora.hora + '-' + objHora.idDentista).className =
      'btn-custom-badge-selected badge';
    this.horaAnterior = objHora.hora + '-' + objHora.idDentista;

    this.navigate('schedule/date/confirm');
  }

  prevButton() {
    let rsInfo = localStorage.getItem('sumDayNext');
    if (parseInt(rsInfo) != 1) {
      this.spinner.show();

      this.objectToSend['fecha_inicio'] = moment(
        this.objectToSend['fecha_inicio']
      )
        .subtract(14, 'days')
        .format('YYYY-MM-DD');
      this.objectToSend['fecha_termino'] = moment(
        this.objectToSend['fecha_termino']
      )
        .subtract(14, 'days')
        .format('YYYY-MM-DD');
      this.objectToSend['tipo'] = 2;

      let count = parseInt(rsInfo) - 1;
      localStorage.setItem('sumDayNext', count + '');
      this.selectItem = 0;
      this.serverPost();
      this.siguienteFechaDisponible = '';
      this.ngAfterViewChecked();
    }
  }

  nextButton() {
    let rsInfo = localStorage.getItem('sumDayNext');
    let day = moment(this.objectToSend['fecha_inicio'], 'YYYY-MM-DD HH:mm:ss');

    let count = parseInt(rsInfo) + 1;
    localStorage.setItem('sumDayNext', count + '');

    this.spinner.show();
    this.objectToSend['fecha_inicio'] = moment(day)
      .add(14, 'days')
      .format('YYYY-MM-DD');
    this.objectToSend['fecha_termino'] = moment(day)
      .add(27, 'days')
      .format('YYYY-MM-DD');
    this.objectToSend['tipo'] = 2;
    this.selectItem = 0;
    this.serverPost();

    this.siguienteFechaDisponible = '';
    this.ngAfterViewChecked();
  }

  daySelectButton(fecha: string) {
    for (let i = 0; this.officesCercanas.length > i; i++) {
      this.officesCercanas[i].disponible = false;
      this.officesCercanas[i].existe = 0;
    }

    this.daySelect = fecha;
    this.listAgendaSelect = [];
    for (let fecha in this.listFecha) {
      if (this.listFecha[fecha].fecha == this.daySelect) {
        let listDoct = this.listFecha[fecha].doctor;
        for (let horas in listDoct) {
          for (let i = 0; this.officesCercanas.length > i; i++) {
            if (listDoct[horas].listHora.length != 0) {
              if (listDoct[horas].idSucursal == this.officesCercanas[i].id) {
                this.officesCercanas[i].disponible = true;
                break;
              }
            }

            for (let i = 0; this.officesCercanas.length > i; i++) {
              if (listDoct[horas].listHora.length != 0) {
                if (
                  this.objectToSend['id_sucursal'] != this.officesCercanas[i].id
                ) {
                  this.officesCercanas[i].existe = 1;
                  break;
                }
              }
            }
          }
        }
        this.listAgendaSelect = this.listFecha[fecha].doctor;
        break;
      }
    }

    try {
      this.fechaAnterior === ''
        ? ''
        : (document.getElementById(this.fechaAnterior).className =
            'btn-custom-badge-2');
    } catch (error) {}

    document.getElementById(fecha).className = 'btn-custom-badge-2-selected';
    this.fechaAnterior = fecha;
    this.siguienteFechaDisponible = fecha;
  }

  serverPost() {
    this.isLoaded = false;
    let url = apiRequest.getDentistsHoras;
    if (localStorage.getItem('typeBusq') == '2') {
      url = apiRequest.getDentistSchedule;
    } else if (localStorage.getItem('typeBusq') == '3') {
      url = apiRequest.getDentistSchedule;
    }
    this.spinner.show();
    const postProm = this.mngSV.postData(url, this.objectToSend);
    if (postProm !== null) {
      postProm
        .then((res) => {
          localStorage.setItem('datos', JSON.stringify(res));
          localStorage.setItem('office', JSON.stringify(this.offices));
          localStorage.setItem(
            'objectToSend',
            JSON.stringify(this.objectToSend)
          );
          this.spinner.hide();
          this.loadInfo();
        })
        .catch((err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `${err.message}`,
          });
        });
    }
  }

  onChange(valor) {
    if (localStorage.getItem('objectToSend') != null) {
      let rsInfo = localStorage.getItem('objectToSend');
      this.objectToSend = JSON.parse(rsInfo);
    }
    this.isLoaded = false;
    let sucursal = this.offices.filter(
      (x) => x.id_sucursal == valor.target.value
    );

    const objectToSendNew = {
      id_sucursal: valor.target.value,
      direccion: this.objectToSend['direccion'],
      time: this.objectToSend['time'],
      id_especialidad: this.objectToSend['id_especialidad'],
      nombre_especialidad: this.objectToSend['nombre_especialidad'],
      urlImg: this.objectToSend['urlImg'],
      detalle_especialidad: this.objectToSend['detalle_especialidad'],
      tipo: this.objectToSend['tipo'],
      id_tratamiento: this.objectToSend['id_tratamiento'],
      list_dentista: this.objectToSend['list_dentista'],
      rut: this.rutEnd,
      fecha_inicio: this.objectToSend['fecha_inicio'],
      fecha_termino: this.objectToSend['fecha_termino'],
      sucursal: sucursal[0]['nombre_sucursal'],
      id_operacion: localStorage.getItem('id_operacion'),
    };
    localStorage.setItem('objectToSend', JSON.stringify(objectToSendNew));
    this.siguienteFechaDisponible = '';
    this.spinner.show();
    const postProm = this.mngSV.postData(
      apiRequest.getDentistsHoras,
      objectToSendNew
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          localStorage.setItem('datos', JSON.stringify(res));
          this.loadInfo();
        })
        .catch((err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `${err.message}`,
          });
        });
    }
  }

  serverPostOffOto(offices, listReserva) {
    const current = offices.find(
      (element) => element.id_sucursal === this.objectToSend['id_sucursal']
    );
    let toArray2 = current.id_proxima.split(',');
    let toArray = [];
    let count = 1;

    let objCurrucel = {
      id: this.objectToSend['id_sucursal'],
      sucursal: this.objectToSend['sucursal'],
      disponible: false,
      existe: 0,
    };

    this.officesCercanas.push(objCurrucel);

    for (let i = 0; toArray2.length > i; i++) {
      const current2 = offices.find(
        (element) => element.id_sucursal === parseInt(toArray2[i])
      );
      if (current2 != null) {
        toArray.push(toArray2[i]);
      }
    }

    if (toArray.length == 0) {
      this.spinner.hide();
      this.initSucursal(listReserva);
    }

    for (let i = 0; toArray.length > i; i++) {
      const current = offices.find(
        (element) => element.id_sucursal === parseInt(toArray[i])
      );

      if (current != null) {
        let url = apiRequest.getDentistsHoras;

        let objectToSendInfo = {};

        objectToSendInfo = this.objectToSend;

        objectToSendInfo['id_sucursal'] = current.id_sucursal;
        objectToSendInfo['list_dentista'] = current.dentistas;
        objectToSendInfo['direccion'] = current.direccion;
        objectToSendInfo['sucursal'] = current.nombre_sucursal;

        let objCurrucel = {
          id: current.id_sucursal,
          sucursal: current.nombre_sucursal,
          disponible: false,
          existe: 0,
        };

        this.officesCercanas.push(objCurrucel);

        this.spinner.show();
        const postProm = this.mngSV.postData(url, objectToSendInfo);
        if (postProm !== null) {
          postProm
            .then((res) => {
              for (let infoHora in res) {
                listReserva.push(res[infoHora]);
              }
              if (toArray.length == count) {
                if (localStorage.getItem('objectToSend') != null) {
                  let rsInfo = localStorage.getItem('objectToSend');
                  this.objectToSend = JSON.parse(rsInfo);
                }

                this.spinner.hide();
                this.initSucursal(listReserva);
              }
              count++;
            })
            .catch((err) => {
              this.spinner.hide();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `${err.message}`,
              });
            });
        }
      }
    }
  }

  serverPostOffOtoDoct(offices, listReserva) {
    this.isLoaded = false;
    let count = 1;

    let objCurrucel = {
      id: this.objectToSend['id_sucursal'],
      sucursal: this.objectToSend['sucursal'],
      disponible: false,
      existe: 0,
    };

    this.officesCercanas.push(objCurrucel);

    for (let i = 0; offices.length > i; i++) {
      if (this.objectToSend['id_sucursal'] != offices[i].id_sucursal) {
        let objectToSendInfo = {};

        objectToSendInfo = this.objectToSend;

        objectToSendInfo['id_sucursal'] = offices[i].id_sucursal;
        objectToSendInfo['sucursal'] = offices[i].clinica;

        let objCurrucel = {
          id: offices[i].id_sucursal,
          sucursal: offices[i].clinica,
          disponible: false,
          existe: 0,
        };

        this.officesCercanas.push(objCurrucel);

        let url = apiRequest.getDentistSchedule;
        this.spinner.show();
        const postProm = this.mngSV.postData(url, objectToSendInfo);
        if (postProm !== null) {
          postProm
            .then((res) => {
              for (let infoHora in res) {
                listReserva.push(res[infoHora]);
              }
              count++;

              if (offices.length == count) {
                if (localStorage.getItem('objectToSend') != null) {
                  let rsInfo = localStorage.getItem('objectToSend');
                  this.objectToSend = JSON.parse(rsInfo);
                }

                this.spinner.hide();
                this.initSucursal(listReserva);
              }
            })
            .catch((err) => {
              this.spinner.hide();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `${err.message}`,
              });
            });
        }
      } else if (offices.length > 0) {
        this.initSucursal(listReserva);
      }
    }
  }

  replaceName(name) {
    var newstr = '';
    if (name.toString().includes('CLÍNICA EVEREST')) {
      newstr = name.toString().replace('CLÍNICA EVEREST', '');
    } else {
      newstr = name.toString().replace('CLINICA EVEREST', '');
    }
    return newstr;
  }
}
