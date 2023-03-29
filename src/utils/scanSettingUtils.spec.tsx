import { getScanSettings } from './scanSettingUtils';
import {
  ModifiedSecretPluginSetting,
  ModifiedSecretPluginSettings
} from '../types';

describe('scanSettingUtils', () => {
  describe('getScanSettings', () => {
    describe('check the number of security plugins if there are some false field exist', () => {
      it('should return the same number of plugins in the setting', () => {
        const mockSetting = {
          redact_secret: 'PARTIAL',
          plugins: {
            'nbdefense.plugins.SecretsPlugin': {
              enabled: true,
              secrets_plugins: {
                KeywordDetector: false,
                'KeywordDetector@keyword_exclude': '',
                Base64HighEntropyString: true,
                'Base64HighEntropyString@limit': 4.5,
                HexHighEntropyString: true,
                'HexHighEntropyString@limit': 3
              }
            },
            'nbdefense.plugins.PIIPlugin': {
              enabled: true,
              confidence_threshold: 0.8,
              entities: {}
            },
            'nbdefense.plugins.LicenseNotebookPlugin': {
              enabled: true,
              accepted_licenses: [],
              licenses_for_notebooks_source: 'HYBRID'
            },
            'nbdefense.plugins.CVENotebookPlugin': {
              enabled: true
            }
          }
        };
        const modifiedSetting = getScanSettings(mockSetting);
        const modifiedSecretPluginSettings = modifiedSetting.plugins[
          'nbdefense.plugins.SecretsPlugin'
        ].secrets_plugins as ModifiedSecretPluginSettings;
        expect(modifiedSecretPluginSettings.length).toEqual(2);
      });
    });

    describe('check all of the details of plugins are modified correctly', () => {
      describe('keyword_exclude field should be exist and value should be empty string', () => {
        let keywordDecorator: ModifiedSecretPluginSetting | undefined;
        beforeEach(() => {
          const mockSetting = {
            redact_secret: 'PARTIAL',
            plugins: {
              'nbdefense.plugins.SecretsPlugin': {
                enabled: true,
                secrets_plugins: {
                  KeywordDetector: true,
                  'KeywordDetector@keyword_exclude': 'Example_Keyword_Exclude'
                }
              },
              'nbdefense.plugins.PIIPlugin': {
                enabled: true,
                confidence_threshold: 0.8,
                entities: {}
              },
              'nbdefense.plugins.LicenseNotebookPlugin': {
                enabled: true,
                accepted_licenses: [],
                licenses_for_notebooks_source: 'HYBRID'
              },
              'nbdefense.plugins.CVENotebookPlugin': {
                enabled: true
              }
            }
          };
          const modifiedSetting = getScanSettings(mockSetting);
          const modifiedSecretPluginSettings = modifiedSetting.plugins[
            'nbdefense.plugins.SecretsPlugin'
          ].secrets_plugins as ModifiedSecretPluginSettings;
          keywordDecorator = modifiedSecretPluginSettings.find(
            item => item.name === 'KeywordDetector'
          );
        });
        it('KeywordDetector should exist in the Secret Plugins', () => {
          expect(keywordDecorator).not.toEqual(undefined);
        });
        it('keyword_exclude field should be exist and the value should be Example_Keyword_Exclude', () => {
          expect(keywordDecorator?.['keyword_exclude']).toEqual(
            'Example_Keyword_Exclude'
          );
        });
      });
      describe('limit of Base64HighEntropyString field should be exist and value should be 4.5', () => {
        let base64HighEntropyString: ModifiedSecretPluginSetting | undefined;
        beforeEach(() => {
          const mockSetting = {
            redact_secret: 'PARTIAL',
            plugins: {
              'nbdefense.plugins.SecretsPlugin': {
                enabled: true,
                secrets_plugins: {
                  Base64HighEntropyString: true,
                  'Base64HighEntropyString@limit': 4.5
                }
              },
              'nbdefense.plugins.PIIPlugin': {
                enabled: true,
                confidence_threshold: 0.8,
                entities: {}
              },
              'nbdefense.plugins.LicenseNotebookPlugin': {
                enabled: true,
                accepted_licenses: [],
                licenses_for_notebooks_source: 'HYBRID'
              },
              'nbdefense.plugins.CVENotebookPlugin': {
                enabled: true
              }
            }
          };
          const modifiedSetting = getScanSettings(mockSetting);
          const modifiedSecretPluginSettings = modifiedSetting.plugins[
            'nbdefense.plugins.SecretsPlugin'
          ].secrets_plugins as ModifiedSecretPluginSettings;
          base64HighEntropyString = modifiedSecretPluginSettings.find(
            item => item.name === 'Base64HighEntropyString'
          );
        });
        it('Base64HighEntropyString should exist in the Secret Plugins', () => {
          expect(base64HighEntropyString).not.toEqual(undefined);
        });
        it('limit field should be exist and the value should be 4.5', () => {
          expect(base64HighEntropyString?.['limit']).toEqual(4.5);
        });
      });
      describe('limit of HexHighEntropyString field should be exist and value should be 3', () => {
        let hexHighEntropyString: ModifiedSecretPluginSetting | undefined;
        beforeEach(() => {
          const mockSetting = {
            redact_secret: 'PARTIAL',
            plugins: {
              'nbdefense.plugins.SecretsPlugin': {
                enabled: true,
                secrets_plugins: {
                  HexHighEntropyString: true,
                  'HexHighEntropyString@limit': 3
                }
              },
              'nbdefense.plugins.PIIPlugin': {
                enabled: true,
                confidence_threshold: 0.8,
                entities: {}
              },
              'nbdefense.plugins.LicenseNotebookPlugin': {
                enabled: true,
                accepted_licenses: [],
                licenses_for_notebooks_source: 'HYBRID'
              },
              'nbdefense.plugins.CVENotebookPlugin': {
                enabled: true
              }
            }
          };
          const modifiedSetting = getScanSettings(mockSetting);
          const modifiedSecretPluginSettings = modifiedSetting.plugins[
            'nbdefense.plugins.SecretsPlugin'
          ].secrets_plugins as ModifiedSecretPluginSettings;
          hexHighEntropyString = modifiedSecretPluginSettings.find(
            item => item.name === 'HexHighEntropyString'
          );
        });
        it('HexHighEntropyString should exist in the Secret Plugins', () => {
          expect(hexHighEntropyString).not.toEqual(undefined);
        });
        it('limit field should be exist and the value should be 3', () => {
          expect(hexHighEntropyString?.['limit']).toEqual(3);
        });
      });
    });
  });
});
