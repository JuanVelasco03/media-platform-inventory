import { Routes } from '@angular/router';
import { MediaInventoryComponent } from './media-inventary/media-inventary.component';

export const routes: Routes = [
  {
      path: 'plataforma-medios',
      component: MediaInventoryComponent
  },
  {
    path: '**',
    redirectTo: 'plataforma-medios'
}
];
