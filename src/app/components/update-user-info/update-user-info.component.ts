import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ManageCallsService } from 'src/app/services/manage-calls.service';
import { apiRequest } from 'src/app/shared/constants';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-user-info',
  templateUrl: './update-user-info.component.html',
  styles: [
    `
      .modal-input-width {
        min-width: 50%;
        max-width: 100%;
      }
    `,
  ],
})
export class UpdateUserInfoComponent implements OnInit {
  @Input() user;
  public maxTel = 11;
  public mixTel = 8;
  public maxEmail = 55;
  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public mngSV: ManageCallsService,
    public spinner: NgxSpinnerService
  ) {}

  miFormulario: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ],
    ],
    telefono: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]*$'),
      ],
    ],
  });

  ngOnInit(): void {}

  isValid(campo: string) {
    return (
      this.miFormulario.controls[campo].touched &&
      this.miFormulario.controls[campo].errors
    );
  }

  send() {
    this.spinner.show();
    const data = this.miFormulario.value;
    const obj = {
      id_user: this.user
        ? this.user.id_paciente
        : localStorage.getItem('id_paciente'),
      email: data.email,
      celular: data.telefono,
      id_operacion: localStorage.getItem('id_operacion'),
    };
    const Prom = this.mngSV.putData(apiRequest.updateInfoPatient, obj);
    if (Prom !== null) {
      Prom.then((resp) => {
        this.spinner.hide();
        if (resp.code !== 1) {
          this.activeModal.close(resp);
        } else {
          this.activeModal.close('error de conexión');
        }
      }).catch((err) => {
        this.spinner.hide();
        this.activeModal.dismiss(err);
      });
    }
  }
}
