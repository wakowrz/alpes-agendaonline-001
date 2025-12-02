import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AppointmentComponent } from './components/appointment/appointment.component';
import { CancelAppointmentComponent } from './components/cancel-appointment/cancel-appointment.component';
import { ConfirmAppointmentComponent } from './components/appointment/confirm-appointment/confirm-appointment.component';
import { HomeComponent } from './components/home/home.component';
const routes: Routes = [
  /* Main */
  { path: 'schedule', component: HomeComponent },
  { path: 'schedule/date', component: AppointmentComponent },
  { path: 'schedule/date/confirm', component: ConfirmAppointmentComponent },
  { path: 'appointments', component: CancelAppointmentComponent },
  { path: '', pathMatch: 'full', redirectTo: 'schedule' },
  { path: '**', pathMatch: 'full', redirectTo: 'schedule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: false,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
