const { GObject, Gtk, GLib, Gio } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/window.ui',
  InternalChildren: [
    'stack',
    'cash_inflow_button',
    'cash_outflow_button',
    'cash_inflow_label',
    'profit_label',
    'cash_outflow_label',
    'register_cash_flow_button',
    'cancel_register_cash_flow_button',
    'cash_flow_value',
    'cash_flow_type',
  ],
}, class FinanceManagerWindow extends Gtk.ApplicationWindow {
  _init(application) {
    super._init({ application });

    this._cash_inflow = 0;
    this._cash_outflow = 0;
    this._update_profit();

    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._profit_label.label = this._profit.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();

    this._cash_inflow_button.connect('clicked', () => this._redirect_register_cash_flow(true));
    this._cash_outflow_button.connect('clicked', () => this._redirect_register_cash_flow(false));
    this._cancel_register_cash_flow_button.connect('clicked', () => this._stack.visible_child_name = 'main');
    this._register_cash_flow_button.connect('clicked', this._register_cash_flow.bind(this));
  }

  _redirect_register_cash_flow(inflow) {
    this._stack.visible_child_name = 'register_cash_flow';
    inflow ? this._cash_flow_type.set_active(0) : this._cash_flow_type.set_active(1);
  }

  _register_cash_flow() {
    const value = this._cash_flow_value.value;
    const type = this._cash_flow_type.get_active_text().toLowerCase();

    if (type === 'inflow') {
      this._cash_inflow += value;
      this._update_profit();
    } else {
      this._cash_outflow += value;
      this._update_profit();
    }

    this._stack.visible_child_name = 'main';
  }

  _update_profit() {
    this._profit = Number((this._cash_inflow - this._cash_outflow).toFixed(2));

    this._profit_label.label = this._profit.toString();
    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();
  }
});

