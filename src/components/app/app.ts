import Loader from '../controller/loader';
import AppView from '../view/view';
import { Products } from '../types';

class App {
  private _controller: Loader;
  private _view: AppView;

  constructor() {
    this._controller = new Loader();
    this._view = new AppView();
  }

  start() {
    this._controller.getResp((data: Products[]) => this._view.drawCart(data));
  }
}

export default App;
