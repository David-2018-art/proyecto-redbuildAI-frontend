import { Component, inject, signal } from '@angular/core';
import { Authservice } from '../../services/authservice';

import { Report01component } from './report01component/report01component';
import { Report02component } from './report02component/report02component';
import { Report03component } from './report03component/report03component';
import { Report04component } from './report04component/report04component';
import { Report05component } from './report05component/report05component';
import { Report06component } from './report06component/report06component';
import { Report07component } from './report07component/report07component';
import { Report08component } from './report08component/report08component';
import { Report09component } from './report09component/report09component';
import { Report10component } from './report10component/report10component';

@Component({
  selector: 'app-reportcomponent',

  imports: [
    Report01component,
    Report02component,
    Report03component,
    Report04component,
    Report05component,
    Report06component,
    Report07component,
    Report08component,
    Report09component,
    Report10component,
  ],

  templateUrl: './reportcomponent.html',
  styleUrl: './reportcomponent.css',
})
export class Reportcomponent {

  readonly auth = inject(Authservice);

  readonly reporteSeleccionado = signal(1);

}