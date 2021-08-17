const { GObject, Gtk, Gio, Json } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/window.ui',
  InternalChildren: [
    'sidebar',
    'listbox',
    'sidebar_home',
    'sidebar_historic',
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

    this._settings = Gio.Settings.new_with_path('com.ermeso.FinanceManager', '/com/ermeso/FinanceManager/');
    this._update_profit();

    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._profit_label.label = this._profit.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();

    this._listbox.connect('row-activated', this._handleSidebarItemSelected.bind(this));
    this._cash_inflow_button.connect('clicked', () => this._redirect_register_cash_flow(true));
    this._cash_outflow_button.connect('clicked', () => this._redirect_register_cash_flow(false));
    this._cancel_register_cash_flow_button.connect('clicked', this._cancel_register_cash_flow.bind(this));
    this._register_cash_flow_button.connect('clicked', this._register_cash_flow.bind(this));
  }

  _handleSidebarItemSelected() {
    const items = [
      'sidebar_home',
      'sidebar_historic',
    ];

    items.forEach(item => {
      switch (item) {
        case 'sidebar_home':
          if(this._sidebar_home.is_selected()) this._stack.visible_child_name = 'main';
          break;
        // case 'sidebar_historic':
        //   break;
      }
    });
  }

  _cancel_register_cash_flow() {
    this._sidebar.reveal_child = true;
    this._stack.visible_child_name = 'main';
  }

  _redirect_register_cash_flow(inflow) {
    this._sidebar.reveal_child = false;
    this._stack.visible_child_name = 'register_cash_flow';
    inflow ? this._cash_flow_type.set_active(0) : this._cash_flow_type.set_active(1);
  }

  _register_cash_flow() {
    const value = this._cash_flow_value.value;
    const type = this._cash_flow_type.get_active_text().toLowerCase();

    if (type === 'inflow') {
      this._settings.set_double('inflow', value + this._cash_inflow);
      this._update_profit();
    } else {
      this._settings.set_double('outflow', value + this._cash_outflow);
      this._update_profit();
    }

    this._sidebar.reveal_child = true;
    this._stack.visible_child_name = 'main';
  }

  _update_profit() {
    this._cash_inflow = this._settings.get_double('inflow');
    this._cash_outflow = this._settings.get_double('outflow');
    this._profit = Number((this._cash_inflow - this._cash_outflow).toFixed(2));

    this._profit_label.label = this._profit.toString();
    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();
  }
});

