import { AbstractControl } from '@angular/forms';

export class MyValidators {

    static GetDigVer(cuerpoRut) {
        let suma = 0,
            dig = 0,
            digver: any = 0,
            multiplo = 2,
            largo = cuerpoRut.length;
        while (largo !== 0) {
            dig = cuerpoRut.substr(largo - 1, 1);
            largo = largo - 1;
            suma = suma + dig * multiplo;
            multiplo = multiplo + 1;
            if (multiplo > 7) {
                multiplo = 2;
            }
        }
        let resto = suma - Math.floor(suma / 11) * 11;
        let fin = 11 - resto;
        if (fin === 10) {
            digver = "K";
        } else {
            if (fin === 11) {
                digver = 0;
            } else {
                digver = fin;
            }
        }
        return digver;
    }
    static checkRut(
        inputRut: AbstractControl
    ) {
        let rut = inputRut.value
        let valor = rut.replace(".", "").replace(".", "").replace("-", "");
        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1).toUpperCase();
        rut = cuerpo.concat("-").concat(dv);
        if (cuerpo.length < 7) {
            return { invalid: true };
        }
        if (dv.toString() !== (MyValidators.GetDigVer(cuerpo)).toString()) {
            return { invalid: true };
        } else {
            return null;
        }
    }

}
