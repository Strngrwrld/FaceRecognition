export class Solicitud{
    soliId: number;
	soliUsu: string;
	soliOperacion: string;
	soliClaveOTP: string;
	usuario:Usuario;

}

export class Usuario{
	usuId:number;
	cliente:Cliente;
}

export class Cliente{
	cliId:number;
	cliApeMaterno:string;
	cliApePaterno:string;
	cliCorrreo:string;
	cliDireccion:string;
	cliFecNac:string;
	cliNombres:string;
	cliNumCelular:string;
	cliFoto: string;
	cliNumDocumento:string;
}