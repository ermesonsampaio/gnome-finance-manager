const { GObject, Gtk } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/window.ui',
  InternalChildren: [
    'stack',
    'actions_row',
  ],
}, class FinanceManagerWindow extends Gtk.ApplicationWindow {
  _init(application) {
    super._init({ application });

    this._actions_row.connect('activate', this._onClickActionsRow.bind(this));
  }

  _onClickActionsRow() {
    log('opa');
  }
});

