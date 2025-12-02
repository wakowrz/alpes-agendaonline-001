import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  public faBars = faBars

  public isCollapsed = true;
  constructor() { }

  ngOnInit(): void {
  }

}
