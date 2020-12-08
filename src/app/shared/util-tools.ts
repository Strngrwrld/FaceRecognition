import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class UtilTools {
  ruta: string;

  /*TImer varibles*/
  timeLeft: number = 1;
  interval;

  constructor(public router: Router,
    private spinner: NgxSpinnerService,
    
  ) { }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  alert(tipo: any, _title: string, msg: string) {

    Swal.fire({
      icon: tipo,
      title: _title,
      text: msg,
      allowOutsideClick: false
    });
  }
/*
  alertWithNavigate(tipo: any, _title: string, msg: string,navigate: string, buttoncolor ?: string, buttontext ?: string) {
    
    if(buttontext == undefined){
      buttontext = this.translate.instant('alert.alert_ok')
    }

    if(buttoncolor == undefined){
      buttoncolor =   this.translate.instant('alert.alert_button_color')
    }

    Swal.fire({
      type: tipo,
      title: _title,
      text: msg,
      confirmButtonColor: buttoncolor,
      confirmButtonText: buttontext,
    }).then((result) => {
      this.navigate(navigate)
    })
  }
*/
  navigate(ruta :string){
    this.router.navigate([ruta]);
  }

  public Timer = () => {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.spinner.show();
        clearInterval(this.interval);
        this.interval = 0;
        this.timeLeft = 1;
      }
    }, 50);
  }

  public CloseTimer = () => {
    clearInterval(this.interval);
    this.interval = 0;
    this.timeLeft = 1;
    this.spinner.hide();
  }

  public b64toBlob(b64Data, contentType, sliceSize) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

}
