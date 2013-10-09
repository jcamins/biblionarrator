var Renderer = require('../lib/environment/renderer');
window.environment = window.environment || { };
window.environment.renderer = new Renderer({ i18next: i18n });
