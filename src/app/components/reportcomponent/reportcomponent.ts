import { Component, inject } from '@angular/core';
import { Authservice } from '../../services/authservice';
import { Report01component } from './report01component/report01component';
import { Report02component } from './report02component/report02component';

@Component({
  selector: 'app-reportcomponent',
  imports: [Report01component, Report02component],
  templateUrl: './reportcomponent.html',
  styleUrl: './reportcomponent.css',
})
export class Reportcomponent {
  readonly auth = inject(Authservice);
}