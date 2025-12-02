export default class myFunctions {
  static formatRut(rut) {
    // XX.XXX.XXX-X
    const newRut = rut
      .replace(/\./g, "")
      .replace(/\-/g, "")
      .trim()
      .toLowerCase();
    const lastDigit = newRut.substr(-1, 1);
    const rutDigit = newRut.substr(0, newRut.length - 1);
    let format = "";
    for (let i = rutDigit.length; i > 0; i--) {
      const e = rutDigit.charAt(i - 1);
      format = e.concat(format);
    }
    return format.concat("-").concat(lastDigit);
  }
}
