const { GObject, Gtk, Gio, Json } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/ui/window.ui',
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
    'historic_box',
  ],
}, class FinanceManagerWindow extends Gtk.ApplicationWindow {
  _init(application) {
    super._init({ application });

    this._settings = Gio.Settings.new_with_path('com.ermeso.FinanceManager', '/com/ermeso/FinanceManager/');
    this._updateProfit();
    this._loadHistoric();

    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._profit_label.label = this._profit.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();

    this._listbox.connect('row-activated', this._handleSidebarItemSelected.bind(this));
    this._cash_inflow_button.connect('clicked', () => this._redirectRegisterCashFlow(true));
    this._cash_outflow_button.connect('clicked', () => this._redirectRegisterCashFlow(false));
    this._cancel_register_cash_flow_button.connect('clicked', this._cancelRegisterCashFlow.bind(this));
    this._register_cash_flow_button.connect('clicked', this._registerCashFlow.bind(this));
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
        case 'sidebar_historic':
          if(this._sidebar_historic.is_selected()) this._stack.visible_child_name = 'historic';
          break;
      }
    });
  }

  _cancelRegisterCashFlow() {
    this._sidebar.reveal_child = true;
    this._stack.visible_child_name = 'main';
  }

  _redirectRegisterCashFlow(inflow) {
    this._sidebar.reveal_child = false;
    this._stack.visible_child_name = 'register_cash_flow';
    inflow ? this._cash_flow_type.set_active(0) : this._cash_flow_type.set_active(1);
  }

  _registerCashFlow() {
    const value = this._cash_flow_value.value;
    const type = this._cash_flow_type.get_active_text().toLowerCase();

    if (type === 'inflow') {
      this._settings.set_double('inflow', value + this._cash_inflow);
      this._updateProfit();
    } else {
      this._settings.set_double('outflow', value + this._cash_outflow);
      this._updateProfit();
    }

    this._updateHistoric(value);

    this._sidebar.reveal_child = true;
    this._stack.visible_child_name = 'main';

    this._cash_flow_value.set_value(0);
  }

  _updateProfit() {
    this._cash_inflow = this._settings.get_double('inflow');
    this._cash_outflow = this._settings.get_double('outflow');
    this._profit = Number((this._cash_inflow - this._cash_outflow).toFixed(2));

    this._profit_label.label = this._profit.toString();
    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();
  }

  _loadHistoric() {
    this._historic = Json.from_string(this._settings.get_string('historic'));

    this._historic.get_array().foreach_element((array, index, value) => {
      const label = new Gtk.Label({ label: Json.to_string(value, false) });
      this._historic_box.prepend(label);
    });
  }

  _updateHistoric(value) {
    this._historic.get_array().add_int_element(value);
    this._settings.set_string('historic', Json.to_string(this._historic, false));

    log(this._settings.get_string('historic'));

    const label = new Gtk.Label({ label: value.toString() });
    this._historic_box.prepend(label);
  }
});

