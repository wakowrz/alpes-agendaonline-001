import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizade',
})
export class CapitalizadePipe implements PipeTransform {
  transform(value: string, active: boolean = true): string {
    if (!value || typeof value !== 'string') return '';

    value = value.toLocaleLowerCase();
    const names = value.split(' ').map((n) => (n ? n : ''));

    if (active) {
      return names
        .map((name) => (name ? name[0].toUpperCase() + name.slice(1) : ''))
        .join(' ');
    } else {
      // Capitalize only the first word
      if (!names[0]) return '';
      names[0] = names[0][0].toUpperCase() + names[0].slice(1);
      return names.join(' ');
    }
  }
}
