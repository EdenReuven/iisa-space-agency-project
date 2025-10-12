import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components';
import { navLinks } from './utils/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , Header ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  navLinks = navLinks
  protected readonly title = signal('iisa-space-agency-project');
}
