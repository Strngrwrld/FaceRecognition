import { FaceVerify } from './../../model/azureResponse';
import { Solicitud, Usuario, Cliente } from './../../model/solicitud';
import { SolicitudService } from './../../service/solicitud.service';
import { UtilTools } from './../../../shared/util-tools';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-biometria-pop-up',
  templateUrl: './biometria-pop-up.component.html',
  styleUrls: ['./biometria-pop-up.component.css']
})
export class BiometriaPopUpComponent implements OnInit {
  public cam;
  captura: boolean;
  /*TImer varibles*/
  timeLeft: number;
  interval;
  flag: boolean;
  
  sexo: string;
  timer: boolean;
  cuenta:boolean;
  comentario: string;
  faceId1:string;
  faceId2: string;
  persona:string;
  solicitud:Solicitud;
  constructor(
    public dialogRef: MatDialogRef<BiometriaPopUpComponent>,
    private utilsTools: UtilTools,
    private solicitudService: SolicitudService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.timeLeft = 5;
    this.captura = true;
    this.timer = true;
    this.flag = false;
    this.cuenta=false;
    this.faceId1 = undefined;
    this.faceId2 = undefined;
  }

  ngOnInit() {

    this.solicitud = this.data.solicitud;
    this.faceId1 = this.data.faceId1;
    let cliente =  this.solicitud.usuario.cliente

    this.persona = cliente.cliNombres + ' ' + cliente.cliApePaterno + ' ' + cliente.cliApeMaterno
  }




  async start(): Promise<void> {
    this.utilsTools.Timer()

    this.flag = true;
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/models')
    await faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/models')
    await faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/models')
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/models').then(this.startVideo);

  }


  startVideo = () => {


    this.cam = document.getElementById('cam');

    navigator.getUserMedia(
      { video: {} },
      stream => this.cam.srcObject = stream,
      err => console.error(err)
    )

    let marco = document.getElementById('marco');

    this.cam.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(this.cam)

      marco.append(canvas)
      canvas.style.position = 'absolute'

      const displaySize = { width: this.cam.width, height: this.cam.height }
      faceapi.matchDimensions(canvas, displaySize)
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(this.cam, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)

        resizedDetections.forEach(detections => {
          const { age, gender, expressions } = detections;

          if (gender === 'male') {
            this.sexo = 'Hombre'
          } else {
            this.sexo = 'Mujer'
          }

          if (expressions.happy >= 0.96 && expressions.happy <= 1) {
            
            this.comentario='Sonrisa Perfecta!'
            this.cuenta=true;

            if (this.timer) {

              this.timer = false;

              this.interval = setInterval(() => {
                if (this.timeLeft > 0) {
                  this.timeLeft--;
                } else {

                  this.CamCloseTimer();
                  this.capture();
                }
                console.log("TIMER : " + this.timeLeft)
              }, 1000);
            }
          } else {
            this.comentario='Prueba mostando tu sonrisa'
            this.CamCloseTimer();
            this.timer = true;
            this.cuenta=false;
          }
        })
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      }, 100)
    })

    this.utilsTools.CloseTimer();

  }


  capture() {
    this.utilsTools.Timer();
    this.cam.pause();
    const canvas = faceapi.createCanvasFromMedia(this.cam)
    var context = canvas.getContext('2d');
    const displaySize = { width: this.cam.width, height: this.cam.height }
    context.drawImage(this.cam, 0, 0, displaySize.width, displaySize.height);
    let foto = canvas.toDataURL();
    /*
    let enlace = document.createElement('a')
    enlace.download = "prueba.jpg"
    enlace.href = foto;
    */
    const blob = this.utilsTools.dataURItoBlob(foto);
    const resultFile = new File([blob], "file_name");
    this.faceDetect(resultFile);
  }


  faceDetect(resultFile: any){
    this.solicitudService.faceDetect(resultFile).subscribe(res => {
      this.faceId2 = res[0].faceId;
      this.faceVerify();
    });
  }

  faceVerify(){

    this.flag = false;
    
    let face :FaceVerify
    
    if(this.faceId1 == undefined || this.faceId2 == undefined){
      this.utilsTools.CloseTimer();
      this.utilsTools.alert('warning','Verificación Biometrica','No se encontro foto a verificar')
      return
    }
    face = new FaceVerify();
    face.faceId1 = this.faceId1
    face.faceId2 = this.faceId2
    
    this.solicitudService.faceVerify(face).subscribe(res =>{

     if(res.isIdentical){
       this.generarOTP()
     }else{
      this.utilsTools.alert('warning','Verificación Biometrica','Rostro dectado no corresponde a '+ this.persona)
     }

    },error =>{
       this.utilsTools.alert('warning','Verificación Biometrica','Ocurrio un error al verificar foto')
    })
  }

  generarOTP(){
    
    let solicitud = new Solicitud;
    solicitud.soliId = +sessionStorage.getItem('soliId')
    solicitud.soliOperacion = 'GENERAR OTP'

    this.solicitudService.procesar(solicitud).subscribe(res => {

      this.utilsTools.CloseTimer();
      this.dialogRef.close();
      sessionStorage.removeItem('soliId');
          
      this.utilsTools.alert('success', 'PERÚBANK', 'Verificacion facial se realizo correctamente, espere un correo con la clave OTP generada')

    },error =>{
      this.utilsTools.CloseTimer();
      this.utilsTools.alert('success', 'PERÚBANK', 'Verificacion facial se realizo correctamente, espere un correo con la clave OTP generada')
    });

  }


  private CamCloseTimer = () => {
    clearInterval(this.interval);
    this.interval = 0;
    this.timeLeft = 5;
  }

}
