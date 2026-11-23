import { Routes } from '@angular/router';

import { Rolecomponent } from './components/rolecomponent/rolecomponent';
import { Rlistcomponent } from './components/rolecomponent/rlistcomponent/rlistcomponent';
import { Rinsertcomponent } from './components/rolecomponent/rinsertcomponent/rinsertcomponent';
import { Rupdatecomponent } from './components/rolecomponent/rupdatecomponent/rupdatecomponent';

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

import { Publicationphotocomponent } from './components/publicationphotocomponent/publicationphotocomponent';
import { Pplistcomponent } from './components/publicationphotocomponent/pplistcomponent/pplistcomponent';
import { Ppinsertcomponent } from './components/publicationphotocomponent/ppinsertcomponent/ppinsertcomponent';
import { Ppbuscarcomponent } from './components/publicationphotocomponent/ppbuscarcomponent/ppbuscarcomponent';
import { Ppupdatecomponent } from './components/publicationphotocomponent/ppupdatecomponent/ppupdatecomponent';
import { authGuard } from './auth.guard';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Transaccioncomponent } from './components/transaccioncomponent/transaccioncomponent';
import { Tlistcomponent } from './components/transaccioncomponent/tlistcomponent/tlistcomponent';
import { Tinsertcomponent } from './components/transaccioncomponent/tinsertcomponent/tinsertcomponent';
import { Resenacomponent } from './components/resenacomponent/resenacomponent';
import { Relistcomponent } from './components/resenacomponent/relistcomponent/relistcomponent';
import { Reinsertcomponent } from './components/resenacomponent/reinsertcomponent/reinsertcomponent';


import { Categorycomponent } from './components/categorycomponent/categorycomponent';
import { Clistcomponent } from './components/categorycomponent/clistcomponent/clistcomponent';
import { Cinsertcomponent } from './components/categorycomponent/cinsertcomponent/cinsertcomponent';
import { Cupdatecomponent } from './components/categorycomponent/cupdatecomponent/cupdatecomponent';

import { Productcomponent } from './components/productcomponent/productcomponent';
import { Prlistcomponent } from './components/productcomponent/prlistcomponent/prlistcomponent';
import { Prinsertcomponent } from './components/productcomponent/prinsertcomponent/prinsertcomponent';
import { Prupdatecomponent } from './components/productcomponent/prupdatecomponent/prupdatecomponent';

import { Uupdatecomponent } from './components/usercomponent/uupdatecomponent/uupdatecomponent';
import { Reupdatecomponent } from './components/resenacomponent/reupdatecomponent/reupdatecomponent';
import { Tupdatecomponent } from './components/transaccioncomponent/tupdatecomponent/tupdatecomponent';

export const routes: Routes = [
  { path: 'login', component: Logincomponent },
  {
    path: 'transacciones',
    component: Transaccioncomponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Tlistcomponent },
      { path: 'registrar', component: Tinsertcomponent },
      { path: 'editar/:id', component: Tupdatecomponent },
    ],
  },
  {
    path: 'resenas',
    component: Resenacomponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Relistcomponent },
      { path: 'registrar', component: Reinsertcomponent },
      { path: 'editar/:id', component: Reupdatecomponent },
    ],
  },
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
      { path: 'editar/:id', component: Rupdatecomponent },
      { path: 'editar/:id', component: Uupdatecomponent },
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
      { path: 'editar/:id', component: Pinsertcomponent },    ],
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
    path: 'fotos-publicaciones',
    component: Publicationphotocomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Pplistcomponent },
      { path: 'registrar', component: Ppinsertcomponent },
      { path: 'buscar', component: Ppbuscarcomponent },
      { path: 'editar/:id', component: Ppupdatecomponent },
    ],
  },

  {
  path: 'categorias',
  component: Categorycomponent,
  children: [
    { path: '', redirectTo: 'listar', pathMatch: 'full' },
    { path: 'listar', component: Clistcomponent },
    { path: 'registrar', component: Cinsertcomponent },
    { path: 'editar/:id', component: Cupdatecomponent },
  ],
},

{
  path: 'productos',
  component: Productcomponent,
  children: [
    { path: '', redirectTo: 'listar', pathMatch: 'full' },
    { path: 'listar', component: Prlistcomponent },
    { path: 'registrar', component: Prinsertcomponent },
    { path: 'editar/:id', component: Prupdatecomponent },
  ],
},

  {
    path: '**',
    redirectTo: 'roles/listar',
  },
];
