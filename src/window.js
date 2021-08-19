const { GObject, Gtk, Gio, Json } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/ui/window.ui',
  InternalChildren: [
    'sidebar',
    'listbox',
    'sidebar_home',
    'sidebar_history',
    'stack',
    'cash_inflow_button',
    'cash_outflow_button',
    'cash_inflow_label',
    'profit_label',
    'cash_outflow_label',
    'register_cash_flow_button',
    'cancel_register_cash_flow_button',
    'cash_flow_title',
    'cash_flow_value',
    'cash_flow_type',
    'history_box',
  ],
}, class FinanceManagerWindow extends Gtk.ApplicationWindow {
  _init(application) {
    super._init({ application });

    this._settings = Gio.Settings.new_with_path('com.ermeso.FinanceManager', '/com/ermeso/FinanceManager/');
    this._updateProfit();
    this._loadHistory();

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
      'sidebar_history',
    ];

    items.forEach(item => {
      switch (item) {
        case 'sidebar_home':
          if(this._sidebar_home.is_selected()) this._stack.visible_child_name = 'main';
          break;
        case 'sidebar_history':
          if(this._sidebar_history.is_selected()) this._stack.visible_child_name = 'history';
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
    const title = this._cash_flow_title.get_buffer().text;
    const value = this._cash_flow_value.value;
    const type = this._cash_flow_type.get_active_text().toLowerCase();
    const date = this._getDate();

    if(!title && !value && !type) return;

    const json = `{ "title": "${title}", "value": ${value}, "type": "${type}", "date": "${date}" }`;

    this._history.get_array().add_element(Json.from_string(json));

    this._settings.set_string('history', Json.to_string(this._history, false));
    this._newHistoryRow(title, value, type, date);

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

  _loadHistory() {
    this._history = Json.from_string(this._settings.get_string('history'));

    this._history.get_array().foreach_element((array, index, object) => {
      const data = object.get_object();

      this._newHistoryRow(
        data.get_string_member('title'),
        data.get_int_member('value'),
        data.get_string_member('type'),
        data.get_string_member('date'),
      );
    });
  }

  _newHistoryRow(title, value, type, date) {
    function newLabel(str) {
      const label = new Gtk.Label();
      label.label = String(str);
      label.height_request = 38;

      return label;
    }

    const button = new Gtk.Button();

    const row = new Gtk.Box({ orientation: 1, spacing: 0 });
    row.width_request = 300;

    row.append(newLabel(title));

    let revealerState = false;
    const revealer = new Gtk.Revealer();
    revealer.set_transition_type(4);
    revealer.set_transition_duration(300);
    revealer.reveal_child = revealerState;

    const revealerBox = new Gtk.Box({ orientation: 1, spacing: 0 });

    revealerBox.append(new Gtk.Separator());
    revealerBox.append(newLabel(`Value: ${value}`));
    revealerBox.append(new Gtk.Separator());
    revealerBox.append(newLabel(`Type: ${type}`));
    revealerBox.append(new Gtk.Separator());
    revealerBox.append(newLabel(`Created At: ${date}`));


    button.connect('clicked', () => {
      revealerState = !revealerState;
      revealer.set_reveal_child(revealerState);
    });

    row.append(revealer);
    revealer.set_child(revealerBox);
    button.set_child(row);

    this._history_box.prepend(button);
  }

  _getDate() {
    var today = new Date();
    var dd = String(today.getDate());
    var mm = String(today.getMonth() + 1);
    var yyyy = today.getFullYear();

    log(mm + '/' + dd + '/' + yyyy);

    return mm + '/' + dd + '/' + yyyy;
  }
});

