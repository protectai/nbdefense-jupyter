import {
  ScanSettings,
  RawSecretsPluginSettings,
  ModifiedSecretPluginSettings
} from '../types';

export const getScanSettings = (rawSettings: ScanSettings): ScanSettings => {
  const rawSecretPluginSetting = rawSettings.plugins[
    'nbdefense.plugins.SecretsPlugin'
  ].secrets_plugins as RawSecretsPluginSettings;

  const newSecretPluginSettings: ModifiedSecretPluginSettings = [];
  const childKeys = [];
  const keys = Object.keys(rawSecretPluginSetting);
  for (const key of keys) {
    if (key.includes('@')) {
      childKeys.push(key);
    } else if (rawSecretPluginSetting[key]) {
      newSecretPluginSettings.push({
        name: key
      });
    }
  }

  childKeys.forEach(childKey => {
    const tmpAry = childKey.split('@');
    const parentItem = newSecretPluginSettings.find(
      item => item.name === tmpAry[0]
    );
    if (parentItem) {
      if (typeof rawSecretPluginSetting[childKey] === 'number') {
        parentItem[tmpAry[1]] = Number(rawSecretPluginSetting[childKey]);
      } else if (typeof rawSecretPluginSetting[childKey] === 'string') {
        parentItem[tmpAry[1]] = String(rawSecretPluginSetting[childKey]);
      }
    }
  });

  rawSettings.plugins['nbdefense.plugins.SecretsPlugin'].secrets_plugins =
    newSecretPluginSettings;

  return rawSettings;
};
