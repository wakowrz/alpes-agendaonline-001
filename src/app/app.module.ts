import { CUSTOM_ELEMENTS_SCHEMA, NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import locales from '@angular/common/locales/es';

registerLocaleData(locales);

//Components Imports
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppointmentComponent } from './components/appointment/appointment.component';
import { HomeComponent } from './components/home/home.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ResourceUrlSanPipe } from './pipes/domsanitizer/resource-url-san.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CancelAppointmentComponent } from './components/cancel-appointment/cancel-appointment.component';
import { registerLocaleData } from '@angular/common';
import { CapitalizadePipe } from './pipes/capitalizade.pipe';
import { ConfirmAppointmentComponent } from './components/appointment/confirm-appointment/confirm-appointment.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataServiceComponent } from './data-service/data-service.component';
import { UpdateUserInfoComponent } from './components/update-user-info/update-user-info.component';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AppointmentComponent,
    UserFormComponent,
    ResourceUrlSanPipe,
    NavbarComponent,
    FooterComponent,
    CancelAppointmentComponent,
    CapitalizadePipe,
    ConfirmAppointmentComponent,
    UpdateUserInfoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    FormsModule,
    NgSelectModule,
    FormsModule,
    NgxCaptchaModule,
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'es',
    },
    DataServiceComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
