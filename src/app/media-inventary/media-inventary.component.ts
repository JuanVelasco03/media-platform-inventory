import { Component, HostListener, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MediaPlatform, MediaRow } from './interfaces/media-inventary.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';

import Swal from 'sweetalert2';
import { MediaPlatformService } from '../services/media-platform.service';

@Component({
  selector: 'app-media-platform',
  standalone: true,
  imports: [ TranslateModule, ReactiveFormsModule, MatInputModule, CommonModule, MatIconModule, MatButtonModule, MatExpansionModule, MatSelectModule ],
  templateUrl: './media-inventary.component.html',
  styleUrl: './media-inventary.component.css'
})
export class MediaInventoryComponent {
  fb = inject( FormBuilder );

  mediaPlatformService = inject( MediaPlatformService );

  submitted: boolean = false;

  inventaryFinished = false;

  internComunication: FormGroup[] = [];

  externComunication: FormGroup[] = [];

  marketingComunication: FormGroup[] = [];

  characteristics = [
    "Digital", "Físico", "Presencial"
  ]

  ngOnInit(): void {
    this.initRowForms()
    this.getDataMediaInventary();
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    if (!this.canClose()) {
      // Cancelar el evento de cierre
      event.preventDefault();
      // Mensaje personalizado antes de cerrar la pestaña
      event.returnValue = '¿Estás seguro de que quieres salir? Aún no has completado la acción.';
    }
  }

  canClose(): boolean {

    if( this.inventaryFinished ) return true;

    const arrFormValidate = [...this.internComunication, ...this.externComunication, ...this.marketingComunication]

    let result = true;

    // Iteramos sobre cada formulario en internComunication
    arrFormValidate.forEach((form) => {
      const formEntries = Object.entries(form.value);
      // Verificamos si algún campo en el formulario actual no está vacío
      const nonEmptyField = formEntries.some(([key, value]) => value !== '');
      if ( nonEmptyField ) {
        result = false; // Si encontramos un campo no vacío, actualizamos result a false
      }
    });

    return result;
  }

  initRowForms(){
    this.internComunication = [
      this.getFormRow()
    ]

    this.externComunication = [
      this.getFormRow()
    ]

    this.marketingComunication = [
      this.getFormRow()
    ]
  }

  getDataMediaInventary(){
    const data = this.mediaPlatformService.getDataMediaInventary();
    const { internComunication, externComunication, Marketing } = data;

    if( internComunication && externComunication && Marketing ){
      this.internComunication = this.buildFormsRow( internComunication );
      this.externComunication = this.buildFormsRow( externComunication );
      this.marketingComunication = this.buildFormsRow( Marketing );
      this.inventaryFinished = true;
    }

  }

  buildFormsRow( MediaRow: MediaRow[] ): FormGroup[] {
    return MediaRow.map( (row) => {
      //Construye el formulario.
      const form = this.fb.group( row );
      //Deshabilita el formulario.
      form.disable();
      //Devuelve el formulario con los valores y deshabilitado.
      return form;
    });
  }

  getFormRow(){
    const formRow: FormGroup = this.fb.group({
      channel: [ '', Validators.required ],
      characteristics: [ '', Validators.required ],
      restrictions: [ '', Validators.required ],
      periodicity: [ '', Validators.required ],
      indicators: [ '', Validators.required ],
      scope: [ '', Validators.required ],
      topics: [ '', Validators.required ],
      responsible: [ '', Validators.required ]
    });

    return formRow;
  }

  addRow(array: FormGroup[]){
    const rowForm = this.getFormRow()
    array.push(rowForm);
  }

  deleteRow($index: number, array: FormGroup[]) {
    const selectedFormRow = array[$index];

    if (selectedFormRow) {
      const entriesForm = Object.entries(selectedFormRow.value);

      // Verificar si hay algún campo diligenciado
      const hasFilledFields = entriesForm.some(([key, value]) => value !== '');

      if (hasFilledFields) {
        // Mostrar alerta si hay campos diligenciados
        Swal.fire({
          icon: 'warning',
          text: '¿Estás seguro que deseas eliminar esta fila?, perderás la información diligenciada.',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          didOpen: () => {
            document.body.style.overflowY= 'auto';
          }
        }).then((result) => {
          if (result.isConfirmed) {
            array.splice($index, 1);
          }
        });
      } else {
        // Eliminar la fila directamente si todos los campos están vacíos
        array.splice($index, 1);
      }
    }
  }

  saveValuesForms(){

    this.submitted = true;

    const validForms = this.validateForms([ ...this.internComunication, ...this.externComunication, ...this.marketingComunication ])

    const internComunication = this.internComunication.map( (form) => form.value );
    const externComunication = this.externComunication.map( (form) => form.value );
    const Marketing = this.marketingComunication.map( (form) => form.value );

    if(!validForms) return this.showAlertEmptyForm();

    Swal.fire({
      title: '¿Estás seguro de que deseas guardar la información?',
      text: 'Una vez guardada, no podrás modificar la información.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        document.body.style.overflowY = 'auto';
      },

    }).then((result) => {
      if(result.isConfirmed){
        const resSaveMedia = this.mediaPlatformService.saveDataMediaInventary({ internComunication, externComunication, Marketing });
        if( resSaveMedia ){
          this.inventaryFinished = true;
          Swal.fire({
            title: 'Información guardada!',
            text: 'La información ha sido guardada correctamente.',
            icon: 'success',
            didOpen: () => {
              document.body.style.overflowY= 'auto';
            }
          })
          this.mediaPlatformService.generatePdf();
          this.getDataMediaInventary();
        }
      }
    })
  }

  validateForms(formValidate: FormGroup[]): boolean {
    // Verificar si alguno de los formularios no es válido
    const hasInvalidForm = formValidate.some(form => form.invalid);

    // Retornar false si hay al menos un formulario inválido, true en caso contrario.
    return !hasInvalidForm;
  }

  downloadMediaInventaryPdf(){
    this.mediaPlatformService.generatePdf();
  }

  showAlertEmptyForm(){
    Swal.fire({
      title: '',
      text: 'Por favor, completa todos los campos.',
      icon: 'warning',
      didOpen: () => {
        document.body.style.overflowY= 'auto';
      }
    })
  }

  clearMediaInventary(){
    Swal.fire({
      title: '¿Estás seguro que deseas limpiar la matriz?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        document.body.style.overflowY= 'auto';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.mediaPlatformService.clearMediaInventary();
        this.initRowForms();
        this.inventaryFinished = false;
        Swal.fire({
          title: 'Matriz limpiada!',
          text: 'La matriz ha sido limpiada correctamente.',
          icon: 'success',
          didOpen: () => {
            document.body.style.overflowY= 'auto';
          }
        })
      }
      });
  }

}
