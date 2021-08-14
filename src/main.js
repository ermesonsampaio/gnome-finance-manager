pkg.initGettext();
pkg.initFormat();
pkg.require({
  'Gio': '2.0',
  'Gtk': '4.0',
});

const { Gio, Gtk } = imports.gi;

const { FinanceManagerWindow } = imports.window;

function main(argv) {
  const application = new Gtk.Application({
    application_id: 'com.ermeso.FinanceManager',
    flags: Gio.ApplicationFlags.FLAGS_NONE,
  });

  application.connect('activate', app => {
    let activeWindow = app.activeWindow;

    if (!activeWindow) {
      activeWindow = new FinanceManagerWindow(app);
    }

    activeWindow.present();
  });

  return application.run(argv);
}
