
import { Routes } from '@angular/router';

import { Rolecomponent } from './components/rolecomponent/rolecomponent';
import { Rlistcomponent } from './components/rolecomponent/rlistcomponent/rlistcomponent';
import { Rinsertcomponent } from './components/rolecomponent/rinsertcomponent/rinsertcomponent';

import { Usercomponent } from './components/usercomponent/usercomponent';
import { Ulistcomponent } from './components/usercomponent/ulistcomponent/ulistcomponent';
import { Uinsertcomponent } from './components/usercomponent/uinsertcomponent/uinsertcomponent';

import { Publicationcomponent } from './components/publicationcomponent/publicationcomponent';
import { Plistcomponent } from './components/publicationcomponent/plistcomponent/plistcomponent';
import { Pinsertcomponent } from './components/publicationcomponent/pinsertcomponent/pinsertcomponent';
import { Pbuscarcomponent } from './components/publicationcomponent/pbuscarcomponent/pbuscarcomponent';
import { Pupdatecomponent } from './components/publicationcomponent/pupdatecomponent/pupdatecomponent';

import { Locationcomponent } from './components/locationcomponent/locationcomponent';
import { Llistcomponent } from './components/locationcomponent/llistcomponent/llistcomponent';
import { Linsertcomponent } from './components/locationcomponent/linsertcomponent/linsertcomponent';
import { Lbuscarcomponent } from './components/locationcomponent/lbuscarcomponent/lbuscarcomponent';
import { Lupdatecomponent } from './components/locationcomponent/lupdatecomponent/lupdatecomponent';


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
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Rlistcomponent },
      { path: 'registrar', component: Rinsertcomponent },
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
    path: 'publicaciones',
    component: Publicationcomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Plistcomponent },
      { path: 'registrar', component: Pinsertcomponent },
      { path: 'buscar', component: Pbuscarcomponent },
      { path: 'editar/:id', component: Pupdatecomponent },
    ],
  },
  {
    path: 'ubicaciones',
    component: Locationcomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Llistcomponent },
      { path: 'registrar', component: Linsertcomponent },
      { path: 'buscar', component: Lbuscarcomponent },
      { path: 'editar/:id', component: Lupdatecomponent },
    ],
  },
  {
    path: '**',
    redirectTo: 'roles/listar',
  },
];
