import { registerPlugin } from '@capacitor/core';
const Http = registerPlugin('Http', {
  web: () => import('./web').then(m => new m.HttpPluginWeb()),
});
export { Http };
//# sourceMappingURL=index.js.map
