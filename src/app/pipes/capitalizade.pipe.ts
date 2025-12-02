import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizade',
})
export class CapitalizadePipe implements PipeTransform {
  transform(value: string, active: boolean = true): string {
    value = value.toLocaleLowerCase();
    let names = value.split(' ');
    if (active) {
      names = names.map((name) => name[0].toUpperCase() + name.substr(1));
    } else {
      names[0] = names[0][0].toUpperCase() + names[0].substr(1);
    }
    return names.join(' ');
  }
}
