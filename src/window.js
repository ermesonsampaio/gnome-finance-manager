const { GObject, Gtk } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/window.ui',
  InternalChildren: [
    'stack',
    'actions_row',
    'cash_inflow',
    'cash_outflow',
  ],
}, class FinanceManagerWindow extends Gtk.ApplicationWindow {
  _init(application) {
    super._init({ application });

    this._actions_row.connect('activate', () => this._stack.visible_child_name = 'actions');
    this._cash_inflow.connect('clicked', () => this._stack.visible_child_name = 'register_cash_flow');
    this._cash_outflow.connect('clicked', () => this._stack.visible_child_name = 'register_cash_flow');
  }
});

