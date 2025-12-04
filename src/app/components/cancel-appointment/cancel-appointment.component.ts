import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageCallsService } from 'src/app/services/manage-calls.service';
import { UtilService } from 'src/app/services/util.service';
import { apiRequest } from 'src/app/shared/constants';
import { MyValidators } from 'src/app/utils/validators';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import * as moment from 'moment';
import myFunctions from 'src/app/utils/functions';
import { UpdateUserInfoComponent } from '../update-user-info/update-user-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cancel-appointment',
  templateUrl: './cancel-appointment.component.html',
})
export class CancelAppointmentComponent implements OnInit {
  users: any = [];
  cancelAppointmentForm: FormGroup;
  public subscription: Subscription;
  public message: string;

  //Variables de captcha
  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
  siteKey: string = '6LfQa4AhAAAAAFZxRbG7mDlb_z3a_2isYJ9uMbAT';
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'es';
  public useGlobalDomain: boolean = false;
  cellphoneToShow: string = 'Sin telefono asociado';
  emailToShow: string = 'Sin correo asociado';

  constructor(
    private fb: FormBuilder,
    private utSV: UtilService,
    private mngSV: ManageCallsService,
    private spinner: NgxSpinnerService,
    private data: DataServiceComponent,
    private modalSV: NgbModal
  ) {
    localStorage.clear();
  }

  ngOnInit(): void {
    this.subscription = this.data.currentMessage.subscribe(
      (message) => (this.message = message)
    );
    this.buildForm();
  }

  public navigate(path: string) {
    this.utSV.navigateToPath(path);
  }

  private buildForm() {
    this.cancelAppointmentForm = this.fb.group({
      rutPaciente: ['', [Validators.required, MyValidators.checkRut]],
      recaptcha: ['', Validators.required],
    });
  }

  reprogramarHora(user) {
    this.spinner.show();
    if (localStorage.getItem('id_operacion') != null) {
      this.serviceReagendar(user);
    } else {
      const objetoRut = {
        rut: myFunctions.formatRut(user.rut),
      };
      this.getOpId(objetoRut, user);
    }
  }

  serviceReagendar(user) {
    let id_cita = { id_cita: user.id_cita };

    let dt = moment(user.fecha, 'YYYY-MM-DD HH:mm:ss');
    const dataToSend = {
      fecha_inicio: moment(dt).format('YYYY-MM-DD'),
      fecha_termino: moment(dt).add(13, 'days').format('YYYY-MM-DD'),
      id_dentista: user.id_dentista,
      id_especialidad: user.id_especialidad,
      id_sucursal: user.id_sucursal,
      nombre: user.nombre,
      nombre_especialidad: user.especialidad,
      detalle_especialidad: user.detalle_especialidad,
      rut: myFunctions.formatRut(user.rut),
      time: user.time,
      tipo: 2,
      id_operacion: localStorage.getItem('id_operacion'),
    };

    const postProm = this.mngSV.postData(
      apiRequest.getDentistSchedule,
      dataToSend
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          let offices = [
            {
              id_sucursal: res[0].id_sucursal,
              sucursal: res[0].sucursal,
            },
          ];

          setTimeout(() => this.spinner.hide(), 2000);
          localStorage.setItem('typeBusq', '3');
          localStorage.setItem('datos', JSON.stringify(res));
          localStorage.setItem('Rut', myFunctions.formatRut(user.rut));
          localStorage.setItem('objectToSend', JSON.stringify(dataToSend));
          localStorage.setItem('id_cita', JSON.stringify(id_cita));
          localStorage.setItem('office', JSON.stringify(offices));

          this.utSV.navigateToPath('schedule/date');
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

  cancelarHora(user) {
    const { id_cita } = user;

    Swal.fire({
      icon: 'question',
      iconColor: '#f9a825',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#072d69',
      denyButtonColor: '#072d69',
      cancelButtonColor: '#faba1a',
      denyButtonText: 'No, anular mi cita inmediatamente',
      cancelButtonText: 'Cancelar',
      title: 'Actualizar Datos',
      text: '¿Desea actualizar sus datos antes de anular su cita?',
      confirmButtonText: 'Sí, deseo actualizar mis datos',
      width: 750,
    }).then((res) => {
      if (res.isConfirmed) {
        this.openUpdateModal('anular', user);
      } else if (res.isDenied) {
        this.confirmacionCancelarCita(user);
      } else {
        Swal.fire({
          icon: 'info',
          iconColor: '#faba1a',
          title: 'Operación cancelada',
          confirmButtonColor: '#072d69',
        });
      }
    });
  }

  programarHora(user) {
    this.spinner.show();

    if (localStorage.getItem('id_operacion') != null) {
      this.serviceProgramar(user);
    } else {
      const objetoRut = {
        rut: myFunctions.formatRut(user.rut),
      };
      this.getOpId(objetoRut, user);
    }
  }

  serviceProgramar(user) {
    let dt = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
    const dataToSend = {
      fecha_inicio: moment(dt).format('YYYY-MM-DD'),
      fecha_termino: moment(dt).add(13, 'days').format('YYYY-MM-DD'),
      id_dentista: user.id_dentista,
      id_especialidad: user.id_especialidad,
      id_sucursal: user.id_sucursal,
      nombre: user.nombre,
      nombre_especialidad: user.especialidad,
      detalle_especialidad: user.detalle_especialidad,
      rut: myFunctions.formatRut(user.rut),
      time: user.time,
      tipo: 2,
      id_operacion: localStorage.getItem('id_operacion'),
    };

    const postProm = this.mngSV.postData(
      apiRequest.getDentistSchedule,
      dataToSend
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          let offices = [
            {
              id_sucursal: res[0].id_sucursal,
              sucursal: res[0].sucursal,
            },
          ];

          this.spinner.hide();
          localStorage.setItem('typeBusq', '3');
          localStorage.setItem('datos', JSON.stringify(res));
          localStorage.setItem('Rut', myFunctions.formatRut(user.rut));
          localStorage.setItem('objectToSend', JSON.stringify(dataToSend));
          localStorage.setItem('office', JSON.stringify(offices));
          localStorage.removeItem('id_cita');

          this.utSV.navigateToPath('schedule/date');
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

  newMessage(data) {
    this.data.changeMessage(data);
  }
  public cancel() {
    this.spinner.show();
    const objetoRut = {
      rut: myFunctions.formatRut(
        this.cancelAppointmentForm.get('rutPaciente').value
      ),
    };
    this.getOpId(objetoRut, null);
    this.getAllUserInformation(objetoRut);
  }

  //Trae todas las especialidades desde el JSON
  public getAllUserInformation(objetoRut) {
    this.mngSV
      .postDataSubscriber(apiRequest.getUserAppointment, objetoRut)
      .subscribe(
        (response) => {
          this.spinner.hide();
          this.users = response;

          if (this.users.code == 1) {
            Swal.fire({
              icon: 'warning',
              iconColor: '#f9a825',
              confirmButtonColor: '#072d69',
              title: `No se han encontrado citas para el rut ${objetoRut.rut}`,
              text: `Verifica el rut ingresado y vuelve a intentarlo`,
            });
          } else {
            if (this.users[0].celular.length > 4) {
              this.cellphoneToShow =
                new Array(this.users[0].celular.length - 5).fill('x').join('') +
                this.users[0].celular.substr(
                  this.users[0].celular.length - 4,
                  this.users[0].celular.length - 1
                );
            }
            if (this.validateEmail(this.users[0].email)) {
              let split = this.users[0].email.split('@');
              this.emailToShow =
                this.users[0].email.substr(0, 4) +
                new Array(split[0].length - 1).fill('x').join('') +
                '@' +
                split[1];
            }
            let boll = true;
            for (let i = 0; this.users.length > i; i++) {
              let horaActual = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
              let horaIngreso = moment(
                this.users[i].fecha + ' ' + this.users[i].hora_inicio,
                'YYYY-MM-DD HH:mm:ss'
              );
              if (horaActual < horaIngreso) {
                this.users[i]['btnCancel'] = true;
                this.users[i]['historial'] = false;
              } else {
                this.users[i]['historial'] = false;
                this.users[i]['btnCancel'] = false;
                if (boll) {
                  this.users[i]['historial'] = true;
                  boll = false;
                }
              }
            }
          }
        },
        (err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `${err.message}`,
          });
        }
      );
  }

  private validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  private getOpId(obj, user) {
    const Prom = this.mngSV.postData(apiRequest.optId, obj);
    if (Prom != null) {
      Prom.then((res) => {
        if (res.code === 0) {
          localStorage.setItem('id_operacion', res.data);
          if (user != null) {
            this.serviceReagendar(user);
          }
        } else {
          return null;
        }
      }).catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.message}`,
        });
      });
    }
  }

  confirmacionCancelarCita(user) {
    this.spinner.show();
    const objectCita = {
      id_cita: user.id_cita,
      id_operacion: localStorage.getItem('id_operacion'),
    };
    const getProm = this.mngSV.putData(
      apiRequest.cancelAppointment,
      objectCita
    );

    if (getProm !== null) {
      getProm
        .then((response) => {
          this.spinner.hide();
          Swal.fire('Cita anulada', 'Tu cita fue anulada.', 'success');
          this.users = this.users.filter((e) => {
            localStorage.removeItem('id_operacion');
            return e.id_cita !== response.data.id;
          });
          this.getOpId({ rut: user.rut }, null);
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

  openUpdateModal(arg, user) {
    const objetoRut = {
      rut: myFunctions.formatRut(
        this.cancelAppointmentForm.get('rutPaciente').value
      ),
    };
    const modalRef = this.modalSV.open(UpdateUserInfoComponent, {
      centered: true,
      size: 'lg',
      // tamaño de modal esta fijado en los estilos globales dentro de style.scss en modal-content, con un width fijo
    });
    modalRef.componentInstance.user = user;
    modalRef.result
      .then((value) => {
        if (value.code === 0) {
          this.getAllUserInformation(objetoRut);
          Swal.fire({
            icon: 'success',
            title: value.message,
          }).then(() => {
            switch (arg) {
              case 'anular':
                this.confirmacionCancelarCita(user);
                break;
              case 'reagendar':
                this.serviceReagendar(user);
                break;
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: value.message,
          });
        }
      })
      .catch((resp) => {
        if (resp) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `${resp.message}`,
          });
        }
      });
  }
}
