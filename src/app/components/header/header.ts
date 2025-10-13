import { Component, Input } from '@angular/core';
import { NavLink } from '../../types';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  @Input({required : true}) navLinks : NavLink[] = [];
}
