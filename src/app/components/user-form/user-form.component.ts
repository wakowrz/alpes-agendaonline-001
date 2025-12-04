import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import {
  NgbDateStruct,
  NgbModal,
  ModalDismissReasons,
  NgbDatepickerConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { from, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { ManageCallsService } from 'src/app/services/manage-calls.service';
import { UtilService } from 'src/app/services/util.service';
import { BaseFormComponent } from 'src/app/shared/base-form.component';
import { apiRequest } from 'src/app/shared/constants';
import { MyValidators } from 'src/app/utils/validators';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import myFunctions from 'src/app/utils/functions';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent
  extends BaseFormComponent
  implements OnChanges, OnDestroy
{
  private finalizar$ = new Subject();

  public faAngleDown = faAngleDown;
  public specialties = [];
  public selection: string;
  public subSpecialties = [];
  public dentists = [];
  public dentistsName = [];
  public offices = [];
  public officesByComuna = [];
  public profesional = [];
  public profesionalName: string;
  public availableAgenda$: Observable<any>;
  public dentistsByOffice = [];
  public specialtyOfDentist = [];
  public specialtyOfDentistID: string;
  public subSpecialtyOfDentist: [];
  public sucursalOfDentist = [];
  public message: string;
  public subscription: Subscription;
  public objectSubmit: Object;
  searching: boolean;
  nrSelect;
  changeDiente: boolean = false;
  changeDentista: boolean = false;
  model: NgbDateStruct;
  isValid: boolean;
  specialtiesNames = [];
  userForm: FormGroup;
  date: { year: number; month: number };
  submitted = false;

  //Variables de Captha
  //siteKey: string = '6LdwojMfAAAAADEZDH1igVhs3I0ZJGlhC3lyrdU5';
siteKey: string = '6LfQa4AhAAAAAFZxRbG7mDlb_z3a_2isYJ9uMbAT';
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'es';
  public useGlobalDomain: boolean = false;
  constructor(
    private fb: FormBuilder,
    private utSV: UtilService,
    private mngSV: ManageCallsService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private data: DataServiceComponent,
    config: NgbDatepickerConfig
  ) {
    super();
    this.isValid = false;
    this.buildForm();

    localStorage.clear();

    const currentDate = new Date();
    config.minDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };
    config.maxDate = { year: 2099, month: 12, day: 31 };
    config.outsideDays = 'hidden';
  }
  ngOnDestroy(): void {
    this.finalizar$.next(true);
    this.finalizar$.complete();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.startFlow();
    this.subscription = this.data.currentMessage.subscribe(
      (message) => (this.message = message)
    );
  }

  newMessage(data) {
    this.data.changeMessage(data);
  }
  startFlow() {
    switch (this.selection) {
      case 'specialty':
        this.findBySpecialty();
        break;
      case 'profesional':
        this.spinner.show();
        this.findByProfesional();
        break;

      default:
        this.findBySpecialty();
        break;
    }
  }

  //Comienzo flujo por especialidad
  findBySpecialty() {
    let specialty_idEnd;
    this.userForm
      .get('formSpeciality')
      .valueChanges.pipe(takeUntil(this.finalizar$))
      .subscribe((specialty_id) => {
        if (
          specialty_id !== null &&
          specialty_id !== undefined &&
          specialty_id !== '' &&
          this.selection === 'specialty'
        ) {
          specialty_idEnd = specialty_id;
          this.userForm.get('formAttention').setValue('');
          this.userForm.get('formSede').setValue('');
          this.getSubSpecialities(specialty_id);
        }
      });
  }

  actionSelect() {
    this.spinner.show();
    let formAttention = this.userForm.get('formAttention').value;
    if (this.userForm.get('formSpeciality').value === '') {
      this.specialties.forEach((s, i) => {
        s.tipo.map((t) => {
          if (t.nombre === formAttention.nombre) {
            this.userForm
              .get('formSpeciality')
              .setValue(this.specialties[i].id);
            this.userForm.get('formAttention').setValue(formAttention);
          }
        });
      });
    }
    this.getOffices(this.userForm.get('formSpeciality').value, formAttention);
  }

  //comienzo flujo por profesional
  findByProfesional() {
    this.getProfesional();
    this.userForm
      .get('formProfesional')
      .valueChanges.pipe(takeUntil(this.finalizar$))
      .subscribe((dentist) => {
        // Solo proceder si tenemos un objeto válido y estamos en el modo 'profesional'
        if (
          dentist !== null &&
          dentist !== undefined &&
          this.selection === 'profesional'
        ) {
          this.userForm.get('formSpeciality').setValue('');
          this.userForm.get('formAttention').setValue('');
          this.userForm.get('formSede').setValue('');
          this.specialtyOfDentistID = '';
          this.getSpecialityByDentists(dentist);
        } else {
          // Si el valor es vacío (por ejemplo al resetear el formulario), limpiar estados relacionados
          this.specialtyOfDentist = [];
          this.subSpecialtyOfDentist = [];
          this.sucursalOfDentist = [];
        }
      });
  }

  private buildForm() {
    this.userForm = this.fb.group({
      formAttention: ['', Validators.required],
      formSpeciality: ['', Validators.required],
      formSede: ['', Validators.required],
      formRut: ['', [Validators.required, MyValidators.checkRut]],
      formProfesional:
        this.selection === 'profesional' ? ['', Validators.required] : [''],
      recaptcha: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userForm) {
      this.fillForm();
    }
  }

  submitForm() {}

  initForm() {
    this.form = this.fb.group(
      {
        specialties: [null],
      },
      {}
    );
  }

  fillForm() {}
  closeResult = '';

  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  public selectFor(option) {
    if (option !== this.selection) {
      this.selection = option;
      this.userForm.reset({
        formAttention: '',
        formSpeciality: '',
        formComuna: '',
        formSede: '',
        formRut: '',
        formProfesional: '',
        typeOfSearchOne: '',
      });
      this.spinner.show();
      this.getSpecialities();
      this.model = {
        day: 0,
        month: 0,
        year: 0,
      };
      this.startFlow();
      this.subSpecialtyOfDentist = [];
      this.sucursalOfDentist = [];
      this.offices = [];
    }
  }

  public unsubscribeUserForm() {}
  //Flujo por especialidad ----------------------------------------------------------------

  //Trae todas las especialidades desde el JSON
  public getSpecialities() {
    this.subSpecialties = [];
    const getProm = this.mngSV.getData(apiRequest.getSpecialties);
    if (getProm !== null)
      getProm
        .then((response) => {
          this.spinner.hide();
          this.specialties = response;
          this.specialtiesNames = this.specialties
            .map((specialties) => {
              return specialties.especialtyToShow;
            })
            .sort();
          this.specialties.forEach((s) => {
            s.tipo.map((t) => {
              this.subSpecialties.push(t);
            });
          });
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

  //Trae todas las subespecialidades de una especialidad
  public getSubSpecialities(specialty_id) {
    this.specialties.map((specialty) => {
      if (specialty.id === specialty_id) {
        this.subSpecialties = specialty['tipo'];
      }
    });
    this.userForm
      .get('formAttention')
      .valueChanges.pipe(takeUntil(this.finalizar$))
      .subscribe((tratamiento_id) => {
        if (
          tratamiento_id !== null &&
          tratamiento_id !== undefined &&
          tratamiento_id != '' &&
          this.selection === 'specialty'
        ) {
          this.userForm.get('formSede').setValue('');
        }
      });
  }

  //Trae todas las sedes de una especialidad
  public getOffices(specialty_id, tratamiento_id) {
    tratamiento_id = tratamiento_id.tratamiento_id;
    const objectToSend = {
      id: specialty_id,
      especialidad: this.specialties.filter(
        (specialty) => specialty.id === specialty_id
      )[0].especialtyToShow,
      active: this.specialties.filter(
        (specialty) => specialty.id === specialty_id
      )[0].active,
      tipo: this.subSpecialties.filter(
        (specialty) => specialty.tratamiento_id === tratamiento_id
      )[0].nombre,
      tiempo: this.subSpecialties.filter(
        (specialty) => specialty.tratamiento_id === tratamiento_id
      )[0].tiempo,
      list_dentista: this.specialties.filter(
        (specialty) => specialty.id === specialty_id
      )[0].list_dentista,
      urlImg: this.specialties.filter(
        (specialty) => specialty.id === specialty_id
      )[0].urlImg,
    };
    const postProm = this.mngSV.postData(apiRequest.getOffices, objectToSend);
    if (postProm !== null) {
      postProm
        .then((res) => {
          this.spinner.hide();
          this.offices = res['sucursales'];
        })
        .catch((err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `${err.message}`,
          });
        });
      this.userForm
        .get('formSede')
        .valueChanges.pipe(takeUntil(this.finalizar$))
        .subscribe((id_sucursal) => {
          if (id_sucursal !== null || id_sucursal !== undefined) {
          }
        });
    }
  }

  //Trae todos los dentistas
  public getProfesional() {
    const getProm = this.mngSV.getData(apiRequest.getDentists);
    if (getProm !== null)
      getProm
        .then((response) => {
          this.spinner.hide();
          this.dentists = response['data'];
          this.dentistsName = this.dentists.map((dentist) => {
            dentist.nombre;
            return dentist.nombre;
          });
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
  public getSpecialityByDentists(dentist) {
    // Validación: evitar acceder a propiedades cuando dentist es nulo o un string vacío
    if (!dentist || dentist === '') {
      this.specialtyOfDentist = [];
      return;
    }

    this.specialtyOfDentist = dentist.especialidades || [];
    if (this.specialtyOfDentist !== undefined) {
      if (this.specialtyOfDentist.length === 1) {
        this.userForm
          .get('formSpeciality')
          .setValue(this.specialtyOfDentist[0].id);
        this.getSubSpecialitiesTrad(this.specialtyOfDentist[0].id);
      }
    }
    this.userForm
      .get('formAttention')
      .valueChanges.pipe(takeUntil(this.finalizar$))
      .subscribe((specialty) => {
        if (
          specialty !== '' &&
          specialty !== undefined &&
          this.selection === 'profesional' &&
          this.userForm.get('formProfesional').value !== ''
        ) {
          this.specialtyOfDentist.forEach((e) => {
            if (e.tipo.indexOf(specialty) >= 0) {
              this.userForm.get('formSpeciality').setValue(e.id);
            }
          });
        }
      });
    if (this.specialtyOfDentist.length > 1) {
      const ids = this.specialtyOfDentist.map((e) => e.id);
      this.getSubSpecialitiesTrad(ids);
      this.userForm
        .get('formSpeciality')
        .valueChanges.pipe(takeUntil(this.finalizar$))
        .subscribe((value) => {
          this.subSpecialtyOfDentist = [];
          if (value !== '' && value === ids[0]) {
            this.getSubSpecialitiesTrad(ids[0]);
          } else if (value !== '' && value === ids[1]) {
            this.getSubSpecialitiesTrad(ids[1]);
          } else if (value === '') {
            this.getSubSpecialitiesTrad(ids);
          }
        });
    }
  }

  public getSubSpecialitiesTrad(specialty_id) {
    if (Array.isArray(specialty_id)) {
      let tempSubs = [];
      this.specialtyOfDentist.forEach((e) => {
        if (e.id === specialty_id[0] || e.id === specialty_id[1]) {
          tempSubs.push(e['tipo']);
        }
      });
      this.subSpecialtyOfDentist = tempSubs[0].concat(tempSubs[1]);
    } else {
      this.specialtyOfDentist.map((specialty) => {
        if (specialty.id === specialty_id) {
          this.subSpecialtyOfDentist = specialty['tipo'];
        }
      });
    }
  }

  actionSelectDoct() {
    this.userForm.get('formSede').setValue('');
    this.spinner.show();
    this.getOfficeByDentist(
      this.userForm.get('formProfesional').value,
      this.userForm.get('formAttention').value
    );
  }

  public getOfficeByDentist(dentist, subSpecialty) {
    const objectToSend = {
      id_dentista: dentist.id_profesional,
      nombre_especialidad: dentist.especialidades,
      id_especialidad: dentist.especialidades[0].id,
      time: subSpecialty['tiempo'],
      horarios: dentist.horarios,
      detalle_especialidad: subSpecialty['nombre'],
    };
    const postProm = this.mngSV.postData(
      apiRequest.getDentistOffices,
      objectToSend
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          this.sucursalOfDentist = res['sucursales_disponibles'];
          if (this.sucursalOfDentist.length === 1) {
            this.nrSelect = this.sucursalOfDentist[0];
          }
          this.spinner.hide();
          this.objectSubmit = objectToSend;
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
  //----------------------------------------------------------------

  //busca las horas de los dentistas de la sucursal seleccionada
  public soonAsPosible() {
    this.spinner.show();
    let dt = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
    const objectToSend = {
      id_operacion: '',
      id_sucursal: this.userForm.get('formSede').value,
      direccion: this.offices.filter(
        (direccion) =>
          direccion.id_sucursal === this.userForm.get('formSede').value
      )[0].direccion,
      time: this.subSpecialties.filter(
        (specialty) =>
          specialty.tratamiento_id ===
          this.userForm.get('formAttention').value.tratamiento_id
      )[0].tiempo,
      id_especialidad: this.userForm.get('formSpeciality').value,
      nombre_especialidad: this.specialties.filter(
        (specialty) =>
          specialty.id === this.userForm.get('formSpeciality').value
      )[0].especialtyToShow,
      detalle_especialidad: this.subSpecialties.filter(
        (specialty) =>
          specialty.tratamiento_id ===
          this.userForm.get('formAttention').value.tratamiento_id
      )[0].nombre,
      urlImg: this.specialties.filter(
        (specialty) =>
          specialty.id === this.userForm.get('formSpeciality').value
      )[0].urlImg,
      tipo: 1,
      id_tratamiento: this.userForm.get('formAttention').value.tratamieno_id,
      list_dentista: this.offices.filter(
        (specialty) =>
          specialty.id_sucursal === this.userForm.get('formSede').value
      )[0].dentistas,
      rut: myFunctions.formatRut(this.userForm.get('formRut').value),
      fecha_inicio: moment(dt).format('YYYY-MM-DD'),
      fecha_termino: moment(dt).add(13, 'days').format('YYYY-MM-DD'),
      sucursal: this.offices.filter(
        (direccion) =>
          direccion.id_sucursal === this.userForm.get('formSede').value
      )[0].nombre_sucursal,
    };
    this.newMessage(objectToSend);
    const objForId = {
      rut: objectToSend.rut,
      nombre_especialidad: objectToSend.nombre_especialidad,
    };
    this.getOpId(objForId);
    const postProm = this.mngSV.postData(
      apiRequest.getDentistsHoras,
      objectToSend
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          localStorage.setItem('typeBusq', '1');
          localStorage.setItem('datos', JSON.stringify(res));
          localStorage.setItem(
            'Rut',
            myFunctions.formatRut(this.userForm.get('formRut').value)
          );
          localStorage.setItem('office', JSON.stringify(this.offices));
          localStorage.setItem('objectToSend', JSON.stringify(objectToSend));
          localStorage.removeItem('id_cita');
          localStorage.removeItem('sumDayNext');

          if (res.length != 0) {
            this.dentistsByOffice = res[0].dentistas;
          }
          this.spinner.hide();
          this.newMessage(objectToSend);
          this.utSV.navigateToPath('schedule/date');
        })
        .catch((err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: `Error de conexion, intentalo más tarde!(no hay dentistas)`,
            text: err,
          });
        });
    }
  }

  public programSchedule() {
    this.spinner.show();
    let dt = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
    const specialityId = this.userForm.get('formSpeciality').value;

    let objectToSend = {
      id_operacion: '',
      rut: myFunctions.formatRut(this.userForm.get('formRut').value),
      id_dentista: this.userForm.get('formProfesional').value.id_profesional,
      nombre: this.userForm.get('formProfesional').value.nombre,
      id_sucursal: this.userForm.get('formSede').value.id_sucursal,
      sucursal: this.userForm.get('formSede').value.clinica,
      time: this.userForm.get('formAttention').value.tiempo,
      id_especialidad: this.dentists.filter(
        (dentist) =>
          dentist.id_profesional ===
          this.userForm.get('formProfesional').value.id_profesional
      )[0].especialidades[0].id,
      nombre_especialidad: this.dentists
        .filter(
          (dentist) =>
            dentist.id_profesional ===
            this.userForm.get('formProfesional').value.id_profesional
        )[0]
        .especialidades.filter(
          (especialidad) =>
            especialidad.id === this.userForm.get('formSpeciality').value
        )[0].especialtyToShow,
      detalle_especialidad: this.userForm.get('formAttention').value.nombre,
      urlImg: this.dentists
        .filter(
          (dentist) =>
            dentist.id_profesional ===
            this.userForm.get('formProfesional').value.id_profesional
        )[0]
        .especialidades.filter((special) => special.id === specialityId)[0]
        .urlImg,
      tipo: 1,
      fecha_inicio: moment(dt).format('YYYY-MM-DD'),
      fecha_termino: moment(dt).add(13, 'days').format('YYYY-MM-DD'),
    };
    const objForId = {
      rut: objectToSend.rut,
      nombre_especialidad: objectToSend.nombre_especialidad,
    };
    this.getOpId(objForId);
    const postProm = this.mngSV.postData(
      apiRequest.getDentistSchedule,
      objectToSend
    );
    if (postProm !== null) {
      postProm
        .then((res) => {
          this.spinner.hide();
          localStorage.setItem('typeBusq', '2');
          localStorage.setItem('datos', JSON.stringify(res));
          localStorage.setItem(
            'Rut',
            myFunctions.formatRut(this.userForm.get('formRut').value)
          );
          localStorage.setItem(
            'office',
            JSON.stringify(this.sucursalOfDentist)
          );
          localStorage.setItem('objectToSend', JSON.stringify(objectToSend));
          localStorage.removeItem('id_cita');
          localStorage.removeItem('sumDayNext');

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

  private getOpId(obj) {
    const Prom = this.mngSV.postData(apiRequest.optId, obj);
    if (Prom != null) {
      Prom.then((res) => {
        if (res.code === 0) {
          localStorage.setItem('id_operacion', res.data);
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

  onSubmit() {
    if (this.userForm.valid) {
      switch (this.selection) {
        case 'specialty':
          this.soonAsPosible();
          break;
        case 'profesional':
          this.programSchedule();
          break;
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  imgDetinsta() {
    this.changeDiente = false;
    this.changeDentista = true;
  }
  imgDetinstaLost() {
    this.changeDentista = false;
  }

  imgDiente() {
    this.changeDentista = false;
    this.changeDiente = true;
  }
  imgDienteLost() {
    this.changeDiente = false;
  }
}
