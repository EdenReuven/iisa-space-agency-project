import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './components';
import { navLinks } from './utils/common';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , Header ],
  templateUrl: './app.html',
})
export class App {
  navLinks = navLinks
  protected readonly title = signal('iisa-space-agency-project');
  private titleService = inject(Title);
  private router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd),
      map(()=>{
        let route = this.router.routerState.root;
        while(route.firstChild) route = route.firstChild;
        return route.snapshot.data['title'] || 'IISA - Space Agency';
      })
    ).subscribe(pageTitle => {
      this.titleService.setTitle(pageTitle);
    });
  }
}
