import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { ManageCallsService } from 'src/app/services/manage-calls.service';
import { BaseFormComponent } from 'src/app/shared/base-form.component';
import { apiRequest } from 'src/app/shared/constants';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MyValidators } from 'src/app/utils/validators';
import myFunctions from 'src/app/utils/functions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateUserInfoComponent } from '../../update-user-info/update-user-info.component';

@Component({
  selector: 'app-confirm-appointment',
  templateUrl: './confirm-appointment.component.html',
})
export class ConfirmAppointmentComponent
  extends BaseFormComponent
  implements OnInit
{
  isRegistered: boolean = true;

  rut: string;
  showCard = false;
  patient;

  datosDeAgendamiento: [];

  public maxTel = 11;
  public mixTel = 8;

  //Variables de captcha
  public captchaSuccess = false;
  siteKey: string = '6LdwojMfAAAAADEZDH1igVhs3I0ZJGlhC3lyrdU5';
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'es';
  public useGlobalDomain: boolean = false;
  cellphoneToShow: string = 'Sin telefono asociado';
  emailToShow: string = 'Sin correo asociado';

  constructor(
    private fb: FormBuilder,
    private utSV: UtilService,
    private router: Router,
    private mngSV: ManageCallsService,
    private spinner: NgxSpinnerService,
    private modalSV: NgbModal
  ) {
    super();
    this.rut = localStorage.getItem('Rut');
    this.getUserInfo(this.rut);
    this.getDataFromLocalStorage(null);
    this.initForm();
  }
  handleSuccess(captchaResponse: string): void {
    this.captchaSuccess = true;
  }
  getDataFromLocalStorage(object) {
    this.datosDeAgendamiento = JSON.parse(localStorage.getItem('SelectHora'));
    if (object != null) {
      this.patient = {};
      this.patient.nombre = object['nombre'];
      this.patient.rut = object['rut'];
    }
  }

  initForm() {
    this.form = this.fb.group({
      rut: ['', [Validators.required, MyValidators.checkRut]],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(55),
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      phoneNumber: [
        ,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      recaptcha: ['', Validators.required],
    });
    this.fillForm();
  }

  fillForm() {
    this.setValue('rut', this.rut || null);
  }

  override ngOnInit(): void {}

  isValid(campo: string) {
    return (
      this.form.controls[campo].errors && this.form.controls[campo].touched
    );
  }

  onSubmit() {
    const user = {
      rut: myFunctions.formatRut(this.value('rut')),
      nombre: this.value('name'),
      apellidos: this.value('lastName'),
      email: this.value('email'),
      celular: this.value('phoneNumber'),
      id_operacion: localStorage.getItem('id_operacion'),
    };
    this.postUser(user);
    this.spinner.show();
  }

  public getUserInfo(rut) {
    this.spinner.show();
    const cita = JSON.parse(localStorage.getItem('SelectHora'));
    const objetoRut = {
      rut: rut,
      fecha: cita.fecha,
      hora: cita.hora,
      id_operacion: localStorage.getItem('id_operacion'),
    };
    const getProm = this.mngSV.postData(apiRequest.getUserInfo, objetoRut);
    if (getProm !== null)
      getProm
        .then((response) => {
          this.spinner.hide();
          if (response.code == 1) {
            this.isRegistered = false;
          } else {
            {
              if (response.celular.length > 4) {
                this.cellphoneToShow =
                  new Array(response.celular.length - 5).fill('x').join('') +
                  response.celular.substr(
                    response.celular.length - 4,
                    response.celular.length - 1
                  );
              }

              if (this.validateEmail(response.email)) {
                let split = response.email.split('@');
                this.emailToShow =
                  response.email.substr(0, 4) +
                  new Array(split[0].length - 1).fill('x').join('') +
                  '@' +
                  split[1];
              }
              this.showCard = true;
              this.patient = response;
              localStorage.setItem('id_paciente', response.id);
            }
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

  private validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  private postUser(object) {
    this.spinner.show();
    const postProm = this.mngSV.postData(apiRequest.insertPatient, object);
    if (postProm !== null) {
      postProm
        .then((res) => {
          if (res.code == 0) {
            this.spinner.hide();
            Swal.fire({
              icon: 'success',
              title: `Usuario registrado!`,
              text: `${res.message}`,
            });
            this.getUserInfo(this.rut);
            this.getDataFromLocalStorage(object);
            this.showCard = true;
            this.isRegistered = true;
          } else {
            this.spinner.hide();
            Swal.fire({
              icon: 'error',
              title: `No se pudo registrar el usuario`,
              text: `${res.message}`,
            });
          }
        })
        .catch((err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: `El usuario no pudo ser registrado, intentalo más tarde!`,
            text: `${err.message}`,
          });
        });
    }
  }

  public navigate(path: string) {
    this.utSV.navigateToPath(path);
  }

  public reservar() {
    // Push event to dataLayer that user initiated confirm-reservation action
    try {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'agendar_click',
        category: 'agendamiento',
        action: 'confirm_initiate',
        label: this.datosDeAgendamiento?.['nombreEspecialidad'] || null,
        dentist: this.datosDeAgendamiento?.['nombre'] || null,
        appointment_date: this.datosDeAgendamiento?.['fecha'] || null,
        appointment_time: this.datosDeAgendamiento?.['hora'] || null,
      });
    } catch (e) {
      // ignore dataLayer errors
      console.warn('dataLayer push failed', e);
    }

    // Directly proceed with reservation when user clicks "Reservar".
    // The UI now offers a separate link to update user data (openUpdateModal()).
    this.setReserva();
  }

  private setReserva() {
    if (localStorage.getItem('id_cita') != null) {
      this.reagendarServer();
    } else {
      this.agendarServer();
    }
  }

  agendarServer() {
    console.log('************ ESTO ESTA OCURRIENDO Y NO LO ESTAMOS VIENDOOOOOO ***********');
    const object = {
    sucursal_mc: this.datosDeAgendamiento['sucursal'],
      dentista_mc: this.datosDeAgendamiento['nombre'],
      tratamiento_mc: this.datosDeAgendamiento['detalleEspecialidad'],
      id_dentista: this.datosDeAgendamiento['idDentista'],
      id_sucursal: this.datosDeAgendamiento['idSucursal'],
      id_paciente: this.patient.id,
      fecha: this.datosDeAgendamiento['fecha'],
      hora_inicio: this.datosDeAgendamiento['hora'],
      duracion: this.datosDeAgendamiento['duracion'],
      comentario: this.datosDeAgendamiento['detalleEspecialidad'],
      rut: this.rut,
      id_operacion: localStorage.getItem('id_operacion'),
    };
    this.spinner.show();
    const postProm = this.mngSV.postData(apiRequest.insertAppointment, object);
    if (postProm !== null) {
      postProm
        .then((res) => {
          this.spinner.hide();
          try {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
              event: 'agendar_result',
              result: res.code == 0 ? 'success' : 'failure',
              message: res.message || null,
              appointment_date: this.datosDeAgendamiento?.['fecha'] || null,
              appointment_time: this.datosDeAgendamiento?.['hora'] || null,
            });
          } catch (e) {
            console.warn('dataLayer push failed', e);
          }

          if (res.code == 0) {
            Swal.fire({
              icon: 'success',
              title: `Su cita fue registrada.`,
              confirmButtonColor: '#072d69',
              confirmButtonText: 'Volver',
            });
            localStorage.clear();
            this.navigate('/home');
          } else {
            this.spinner.hide();
            Swal.fire({
              icon: 'error',
              title: `No hemos podido registrar la cita.`,
              text: `${res.message}. Favor agende su cita nuevamente.`,
              confirmButtonColor: '#072d69',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                this.navigate('/home');
              } else {
                this.navigate('/home');
              }
            });
          }
        })
        .catch((err) => {
          this.spinner.hide();
          try {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
              event: 'agendar_result',
              result: 'failure',
              message: err?.message || null,
              appointment_date: this.datosDeAgendamiento?.['fecha'] || null,
              appointment_time: this.datosDeAgendamiento?.['hora'] || null,
            });
          } catch (e) {
            console.warn('dataLayer push failed', e);
          }
          Swal.fire({
            icon: 'error',
            title: `La cita no ha podido ser registrada`,
            text: `${err.message}`,
          });
        });
    }
  }
  reagendarServer() {
    let cita = JSON.parse(localStorage.getItem('id_cita'));
    const object = {
      id_sesion: cita.id_cita,
      id_dentista: this.datosDeAgendamiento['idDentista'],
      fecha: this.datosDeAgendamiento['fecha'],
      hora_inicio: this.datosDeAgendamiento['hora'],
      duracion: this.datosDeAgendamiento['duracion'],
      id_operacion: localStorage.getItem('id_operacion'),
    };
    this.spinner.show();
    const postProm = this.mngSV.postData(
      apiRequest.rescheduleAppointment,
      object
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          this.spinner.hide();
          try {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
              event: 'agendar_result',
              result: res.code == 0 ? 'success' : 'failure',
              message: res.message || null,
              appointment_date: this.datosDeAgendamiento?.['fecha'] || null,
              appointment_time: this.datosDeAgendamiento?.['hora'] || null,
            });
          } catch (e) {
            console.warn('dataLayer push failed', e);
          }

          if (res.code == 0) {
            Swal.fire({
              icon: 'success',
              title: `Su cita fue registrada.`,
              confirmButtonColor: '#072d69',
              confirmButtonText: 'Volver',
            });
            localStorage.clear();
            this.navigate('/home');
          } else {
            Swal.fire({
              icon: 'error',
              title: `No hemos podido registrar la cita.`,
              text: `${res.message}. Favor agende su cita nuevamente.`,
              confirmButtonColor: '#072d69',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                this.navigate('/home');
              } else {
                this.navigate('/home');
              }
            });
          }
        })
        .catch((err) => {
          try {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
              event: 'agendar_result',
              result: 'failure',
              message: err?.message || null,
              appointment_date: this.datosDeAgendamiento?.['fecha'] || null,
              appointment_time: this.datosDeAgendamiento?.['hora'] || null,
            });
          } catch (e) {
            console.warn('dataLayer push failed', e);
          }
          Swal.fire({
            icon: 'error',
            title: `La cita no ha podido se registrada`,
            text: `${err.message}`,
          });
        });
    }
  }

  openUpdateModal() {
    const modalRef = this.modalSV.open(UpdateUserInfoComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.user = null;
    modalRef.result
      .then((value) => {
        if (value.code === 0) {
          this.getUserInfo(this.rut);
          Swal.fire({
            icon: 'success',
            title: value.message,
          }).then(() => {
            this.setReserva();
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
