const { GObject, Gtk, Gio, GLib, Json } = imports.gi;

var FinanceManagerWindow = GObject.registerClass({
  GTypeName: 'FinanceManagerWindow',
  Template: 'resource:///com/ermeso/FinanceManager/ui/window.ui',
  InternalChildren: [
    'hide_sidebar_button',
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

    this._buildActions();

    this._loadHistory();
    this._updateProfit();

    this._hide_sidebar_button.connect('toggled', () => this._sidebar.reveal_child = this._hide_sidebar_button.active);
    this._listbox.connect('row-activated', this._handleSidebarItemSelected.bind(this));
    this._cash_inflow_button.connect('clicked', () => this._redirectRegisterCashFlow(true));
    this._cash_outflow_button.connect('clicked', () => this._redirectRegisterCashFlow(false));
    this._cancel_register_cash_flow_button.connect('clicked', this._cancelRegisterCashFlow.bind(this));
    this._register_cash_flow_button.connect('clicked', this._registerCashFlow.bind(this));
  }

  _buildActions() {
    const aboutAction = new Gio.SimpleAction({ name: 'about', parameter_type: null });
    aboutAction.connect('activate', this._showAbout.bind(this));

    this.application.add_action(aboutAction);
  }

  _showAbout() {
    const aboutParams = {
      authors: [
        'Ermeson Sampaio de Queiroz <sampaioermesonjs@gmail.com>',
      ],
      artists: [],
      translator_credits: 'translator-credits',
      comments: 'A finance manager',
      copyright: 'Copyright © 2021 The Finance Manager authors',
      license_type: Gtk.License.GPL_3_0,
      logo_icon_name: 'com.ermeso.FinanceManager',
      version: pkg.version,
      website_label: 'Learn more about Finance Manager',
      website: 'https://github.com/ermesonsampaio/gnome-finance-manager',
      transient_for: this,
      modal: true,
    };

    const aboutDialog = new Gtk.AboutDialog(aboutParams);
    aboutDialog.show();
  };

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
    this._hide_sidebar_button.active = true;
    this._stack.visible_child_name = 'main';
  }

  _redirectRegisterCashFlow(inflow) {
    this._sidebar.reveal_child = false;
    this._hide_sidebar_button.active = false;
    this._stack.visible_child_name = 'register_cash_flow';
    inflow ? this._cash_flow_type.set_active(0) : this._cash_flow_type.set_active(1);
  }

  _registerCashFlow() {
    const title = this._cash_flow_title.get_buffer().text;
    const value = this._cash_flow_value.value;
    const type = this._cash_flow_type.get_active_text().toLowerCase();
    const { date, timestamp } = this._getDate();

    if(!title && !value && !type) return;

    const json = `{ "title": "${title}", "value": ${value}, "type": "${type}", "date": "${date}", "timestamp": "${timestamp}" }`;

    this._history.get_array().add_element(Json.from_string(json));

    this._settings.set_string('history', Json.to_string(this._history, false));
    this._newHistoryRow(title, value, type, date, timestamp);

    this._updateProfit();
    this._sidebar.reveal_child = true;
    this._stack.visible_child_name = 'main';

    this._cash_flow_title.get_buffer().set_text('', 0);
    this._cash_flow_value.set_value(0);
  }

  _updateProfit() {
    this._cash_inflow = 0;
    this._cash_outflow = 0;

    this._history.get_array().foreach_element((array, index, object) => {
      const data = object.get_object();

      if(data.get_string_member('type').toLowerCase() === 'inflow') {
        this._cash_inflow += data.get_double_member('value');
      } else {
        this._cash_outflow += data.get_double_member('value');
      }
    });

    this._profit = Number((this._cash_inflow - this._cash_outflow).toFixed(2));

    this._profit_label.label = this._profit.toString();
    this._cash_inflow_label.label = this._cash_inflow.toString();
    this._cash_outflow_label.label = this._cash_outflow.toString();
  }

  _loadHistory() {
    this._settings = Gio.Settings.new_with_path('com.ermeso.FinanceManager', '/com/ermeso/FinanceManager/');
    this._history = Json.from_string(this._settings.get_string('history'));

    this._history.get_array().foreach_element((array, index, object) => {
      const data = object.get_object();

      this._newHistoryRow(
        data.get_string_member('title'),
        data.get_int_member('value'),
        data.get_string_member('type'),
        data.get_string_member('date'),
        data.get_string_member('timestamp'),
      );
    });
  }

  _newHistoryRow(title, value, type, date, timestamp) {
    function newLabel(str) {
      const label = new Gtk.Label();
      label.label = String(str);
      label.height_request = 38;

      return label;
    }

    const frame = new Gtk.Frame();

    const row = new Gtk.Box({ orientation: 1, spacing: 0 });
    row.width_request = 300;

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
    revealerBox.append(new Gtk.Separator());

    const delButton = new Gtk.Button({ label: 'Delete' });
    delButton.get_style_context().add_class('destructive-action');

    const dialog = new Gtk.MessageDialog({
        title: 'Delete?',
        text: 'This value will be deleted from your data!',
        buttons: [Gtk.ButtonsType.NONE],
        transient_for: this,
    });

    dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
    dialog.add_button('Delete', Gtk.ResponseType.YES);

    dialog.connect('response', (_, res) => {
      dialog.hide();

      if(res === Gtk.ResponseType.YES) {
        this._deleteHistoryItem(timestamp);
        frame.hide();
      }
    });

    delButton.connect('clicked', () => dialog.show());

    revealerBox.append(delButton);

    const button = new Gtk.Button({ label: title });
    button.has_frame = false;

    button.connect('clicked', () => {
      revealerState = !revealerState;
      revealer.set_reveal_child(revealerState);
    });

    row.append(button);
    row.append(revealer);
    revealer.set_child(revealerBox);
    frame.set_child(row);

    this._history_box.prepend(frame);
  }

  _deleteHistoryItem(timestamp) {
    this._history.get_array().foreach_element((array, index, object) => {
      const data = object.get_object();

      const obj_timestamp = data.get_string_member('timestamp');
      if(obj_timestamp == timestamp) {
        this._history.get_array().remove_element(index);
        this._settings.set_string('history', Json.to_string(this._history, false));
        this._updateProfit();
      }
    });
  }

  _getDate() {
    var today = new Date();
    var dd = String(today.getDate());
    var mm = String(today.getMonth() + 1);
    var yyyy = today.getFullYear();

    return {
      date: mm + '/' + dd + '/' + yyyy,
      timestamp: Date.now(),
    };
  }
});

