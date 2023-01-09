export type Route = {
  path: string | RegExp;
  template: string;
  action?: (router: Router, matched?: string[] | boolean | null) => void
}

export class Router {
  private routes: Route[]
  private rootEl: HTMLDivElement
  private errorTemplate: string

  constructor(routes: Route[], rootEl: HTMLDivElement, errorTmpl: string) {
    this.routes = routes
    this.rootEl = rootEl
    this.errorTemplate = errorTmpl
    this.initEvents()
  }

  async handleLocation() {
    const path = window.location.pathname;
    let matchedRoute: Route | null = null
    for (const route of this.routes) {
      let matched = null
      // if path is regexp
      if (typeof route.path !== 'string') {
        matched = path.match(route.path)
      } else {
        matched = path === route.path
      }
      if (matched) {
        matchedRoute = route
        break;
      }
    }
    const html = await fetch(
      matchedRoute ? matchedRoute.template : this.errorTemplate
    ).then((data) => data.text());
    this.rootEl.innerHTML = html;
    if (matchedRoute && matchedRoute.action) {
      matchedRoute.action(this)
    }
  }

  handleLinkRoute(event: Event) {
    if (event.target && event.target instanceof HTMLAnchorElement) {
      event.preventDefault();
      history.pushState({}, event.target.title || 'newUrl', event.target.href);
      this.handleLocation();
    }
  }

  redirectTo(link: string, title: string = '') {
    history.pushState({}, title, link);
    this.handleLocation();
  }

  private initEvents() {
    window.addEventListener('popstate', () => this.handleLocation());
    window.addEventListener('DOMContentLoaded', () => this.handleLocation());
  }
}