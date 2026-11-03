import { Routes } from '@angular/router';
import { Rolecomponent } from './components/rolecomponent/rolecomponent';
import { Rlistcomponent } from './components/rolecomponent/rlistcomponent/rlistcomponent';
import { Rinsertcomponent } from './components/rolecomponent/rinsertcomponent/rinsertcomponent';
import { Usercomponent } from './components/usercomponent/usercomponent';
import { Ulistcomponent } from './components/usercomponent/ulistcomponent/ulistcomponent';
import { Uinsertcomponent } from './components/usercomponent/uinsertcomponent/uinsertcomponent';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'roles/listar',
    pathMatch: 'full',
  },
  {
    path: 'roles',
    component: Rolecomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        component: Rlistcomponent,
      },
      {
        path: 'registrar',
        component: Rinsertcomponent,
      },
    ],
  },

{
  path: 'usuarios',
  component: Usercomponent,
  children: [
    { path: '', redirectTo: 'listar', pathMatch: 'full' },
    { path: 'listar', component: Ulistcomponent },
    { path: 'registrar', component: Uinsertcomponent },
  ],
},

  {
    path: '**',
    redirectTo: 'roles/listar',
  },
];