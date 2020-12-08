export class FaceResponse {
    faceId: string;
    faceRectangle: FaceRectangle;
  }
  
export class FaceRectangle {
    top: number;
    left: number;
    width: number;
    height: number;
}


export class FaceVerify {
  faceId1: string;
  faceId2: string;
  isIdentical : boolean;
}



