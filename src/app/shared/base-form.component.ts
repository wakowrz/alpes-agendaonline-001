import { FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  template: '',
})
export abstract class BaseFormComponent implements OnInit {
  @Input() form: FormGroup;

  public readonly requiredSuffix = ' (*)';

  ngOnInit() {
    this.initForm();
  }

  abstract initForm();

  abstract fillForm(value?: any);

  abstract onSubmit(formValue?: any);

  setValue(name: string, value: any) {
    this.formControl(name).setValue(value);
  }

  updateValue(name: string, value: any) {
    const control = this.control(name);
    control.setValue(value);
    if (!control.dirty) {
      control.markAsDirty();
    }
    control.updateValueAndValidity();
  }

  setValidators(name: string, value: any) {
    this.formControl(name).setValidators(value);
  }

  resetValidators(name: string, validators: any[]) {
    const control = this.control(name);
    control.clearValidators();
    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  resetFormValidators(validators: any[]) {
    this.form.clearValidators();
    this.form.setValidators(validators);
    this.form.updateValueAndValidity();
  }

  updateControlValidators(
    control: AbstractControl,
    enable: boolean,
    validators: ValidatorFn[]
  ) {
    if (enable) {
      control.setValidators(validators);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity();
  }

  value = (name: string): any =>
    this.formControl(name) ? this.formControl(name).value : null;

  nonNull = (value: any, type?: string): any =>
    value || this.getDefaultValue(type);

  /***
   * Use instead of formControl for simplicity
   * @param name formControl name
   */
  control = (name: string): AbstractControl => this.form.get(name);

  /***
   * Deprecated use instead control
   * @param name control name
   */
  formControl = (name: string): AbstractControl => this.form.get(name);

  protected stringifyUpper = (value: any): string =>
    JSON.stringify(value).toUpperCase();

  private getDefaultValue(type?: string): any {
    if (type) {
      switch (type) {
        case 'string':
          return '';
        case 'number':
          return 0;
        case 'array':
          return [];
      }
    }
    return '';
  }
}
