import { Injectable } from '@angular/core';
import { MediaPlatform, MediaRow } from '../media-inventary/interfaces/media-inventary.interface';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { headerBase64 } from './headerPdf';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

// Agregar fuentes personalizadas
(pdfMake as any).fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-BoldItalic.ttf'
  }
};

@Injectable({
  providedIn: 'root'
})
export class MediaPlatformService {

  constructor() { }

  getDataMediaInventary(): MediaPlatform {
    return JSON.parse( localStorage.getItem('MediaInventary') || '{}' );
  }

  saveDataMediaInventary( data: MediaPlatform ): boolean {
    localStorage.setItem( 'MediaInventary', JSON.stringify( data ) );

    return true;
  }

  clearMediaInventary(){
    localStorage.removeItem('MediaInventary');
  }

  generatePdf(){
    const data: MediaPlatform = JSON.parse(localStorage.getItem('MediaInventary') || '{}');
    const { internComunication, externComunication, Marketing } = data;

    if( !internComunication && !externComunication && !Marketing ) return;

    let bodyTable: any = [
      [
        { bold: true, text: 'Canal, medio y/o escenario' }, { bold: true, text: 'Características' },
        { bold: true, text: 'Restricciones' }, { bold: true, text: 'Periodicidad' },
        { bold: true, text: 'Indicadores' }, { bold: true, text: 'Alcance' },
        { bold: true, text: 'Temas' }, { bold: true, text: 'Responsable' },
      ],

      [ { text: 'Comunicación Interna', style: 'tableHeader', colSpan: 8 }, {}, {}, {}, {}, {}, {}, {} ],
      ...internComunication.map( this.buildRowTable ),

      [ { text: 'Comunicación Externa', style: 'tableHeader', colSpan: 8 }, {}, {}, {}, {}, {}, {}, {} ],
      ...externComunication.map( this.buildRowTable ),

      [ { text: 'Marketing', style: 'tableHeader', colSpan: 8 }, {}, {}, {}, {}, {}, {}, {} ],
      ...Marketing.map( this.buildRowTable ),

    ];

    let table: any = [
      {
        text: 'Inventario Plataforma de medios',
        style: 'title',
        alignment: 'center',
      },
      {
        style: 'tableExample',
        table: {
          widths: ['13%', '13%', '9%', '13%', '13%', '13%', '13%', '13%'],
          body: bodyTable,
        }
      },
    ];

    const documentDefinition: any = {
      pageMargins: [20, 10, 20, 10],
      header: {
        margin: [0, 0, 0, 50],
        columns: [{ image: headerBase64, width: 600, heigth: 400, margin: [0, 0, 0, 100]}]
      },
      pageOrientation: 'landscape', // Orientación horizontal
      content: table,
      styles: {
        title: {
          alignment: 'center',
          color: '#282a70',
          margin: [0, 35, 0, 10],
          bold: true,
          fontSize: 24,
        },
        tableHeader: {
          alignment: 'center',
          fillColor: '#5A639C',
          bold: true,
          color: 'white'
        }
      },
      columnGap: 20, // Espacio entre las columnas
      alignment: 'center',
    };

    pdfMake.createPdf( documentDefinition ).download( 'plataforma_de_medios.pdf' );
  }

  private buildRowTable( row: MediaRow ): { text: string }[] {
    return [
      { text: row.channel }, { text: row.characteristics },
      { text: row.restrictions }, { text: row.periodicity },
      { text: row.indicators }, { text: row.scope },
      { text: row.responsible }, { text: row.responsible },
    ];
  }

}


