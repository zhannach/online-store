export type Route = {
  path: string | RegExp;
  src: string;
  action?: (router: Router, matched?: string[] | boolean | null) => Promise<void>;
};

export class Router {
  private routes: Route[];
  private rootEl: HTMLDivElement;
  private errorSrc: string;
  private errorHTML: string = '';

  constructor(routes: Route[], rootEl: HTMLDivElement, errorSrc: string) {
    this.routes = routes;
    this.rootEl = rootEl;
    this.errorSrc = errorSrc;
    this.initEvents();
  }

  async handleLocation() {
    const path = window.location.pathname;
    for (const route of this.routes) {
      let matched = null;
      // if path is regexp
      if (typeof route.path !== 'string') {
        matched = path.match(route.path);
      } else {
        matched = path === route.path;
      }
      if (matched) {
        return await this.render(route, matched)
      }
    }
    return await this.renderError()
  }    

  async render(route: Route, matched: string[] | boolean | null) {
    const html = await fetch(route.src).then((data) => data.text());
    this.rootEl.innerHTML = html;
    if (route.action) {
      try {
        await route.action(this, matched);
      } catch(e) {
        await this.renderError((e as Error).message)
      }
    }
  }

  async renderError(title?: string) {
    if (!this.errorHTML) {
      this.errorHTML = await fetch(this.errorSrc).then((data) => data.text());
    }
    if (title) {
      document.title = title
    }
    this.rootEl.innerHTML = this.errorHTML;
  }

  handleLinkRoute(event: Event) {
    if (event.target && event.target instanceof HTMLAnchorElement) {
      event.preventDefault();
      history.pushState({}, event.target.title || 'newUrl', event.target.href);
      this.handleLocation();
    }
  }

  redirectTo(link: string, title = '') {
    history.pushState({}, title, link);
    this.handleLocation();
  }

  private initEvents() {
    window.addEventListener('popstate', () => this.handleLocation());
    window.addEventListener('DOMContentLoaded', () => this.handleLocation());
  }
}
