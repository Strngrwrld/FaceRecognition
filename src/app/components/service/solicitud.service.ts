import { FaceVerify } from './../model/azureResponse';
import { Solicitud } from './../model/solicitud';
import { Response } from './../model/response';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FaceResponse } from '../model/azureResponse';
@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  constructor(private http: HttpClient) { }

  faceDetect(file?: File) {
    return this.http.post<FaceResponse[]>(environment.FACE_IDENTY, file,{
      headers: new HttpHeaders().set('Content-Type', 'application/octet-stream')
      .set('Ocp-Apim-Subscription-Key','0d804a3dfe5d45349747ba3e02d6632d')
    });
  }

  faceVerify(feceVerify: FaceVerify) {
    return this.http.post<FaceVerify>(environment.FACE_VERIFY, feceVerify,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
      .set('Ocp-Apim-Subscription-Key','0d804a3dfe5d45349747ba3e02d6632d')
    });
  }


  consultarSolicitud(id?: string) {
    return this.http.get<Response<Solicitud>>(environment.DOMINIO +"/api/solicitud/obtener/" +id,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }


  procesar(solicitud: Solicitud) {
    return this.http.post<Response<Solicitud>>(environment.DOMINIO +"/api/solicitud/procesar",solicitud,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
