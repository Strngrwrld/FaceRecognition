import { UtilTools } from './../../../shared/util-tools';
import { SolicitudService } from './../../service/solicitud.service';
import { BiometriaPopUpComponent } from './../biometria-pop-up/biometria-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(

    public dialog: MatDialog,
    private activateRouter: ActivatedRoute,
    private solicitudService: SolicitudService,
    private utilsTools: UtilTools
  ) { }

  ngOnInit(): void {
    this.activateRouter.paramMap.subscribe(params => {
      if (params.has('id')) {
        sessionStorage.setItem('soliId', params.get("id"));
        this.start();
      }

    })
  }



  start() {

    this.utilsTools.Timer();

    this.solicitudService.consultarSolicitud(sessionStorage.getItem('soliId')).subscribe(
      res => {
        let faceId1
        if (res.codigo != 8000) {
          this.utilsTools.CloseTimer();
          this.utilsTools.alert('warning', 'Verificación Biometrica', res.mensaje);
          return;
        }

        const blob = this.utilsTools.b64toBlob(res.data.usuario.cliente.cliFoto,'','1024');
        const resultFile = new File([blob], "file_name");
    
        this.solicitudService.faceDetect(resultFile).subscribe(res1 => {
          
          this.utilsTools.CloseTimer();

        let dialogRef = this.dialog.open(BiometriaPopUpComponent, {
          width: "60vw",
          height: "80vh",
          data:{
            solicitud: res.data,
            faceId : res1[0].faceId,
          },
          panelClass: 'mat-dialog',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(res => {
          if (res != null) {
            console.log("cerro")
          };
        })

          
        },error=>{
          this.utilsTools.CloseTimer();
        });
      },error =>{
        this.utilsTools.CloseTimer();
        this.utilsTools.alert('warning', 'Verificación Biometrica', 'Ocurrio un error, Intenlo nuevamente');
      
      }
    )
  }


}
