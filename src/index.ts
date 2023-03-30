import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ButtonExtension } from './extensions/ButtonExtension';
import { SwitchExtension } from './extensions/SwitchExtension';

import { nbdefenseIcon } from './style/icons';
import { NBDefenseWidget } from './widgets/NBDefenseWidget';

export const PLUGIN_ID = 'nbdefense-jupyter:plugin';
/**
 * Initialization data for the nbdefense-jupyter extension.
 */

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    notebookTracker: INotebookTracker,
    settingRegistry: ISettingRegistry
  ) => {
    let settings: ISettingRegistry.ISettings | undefined;

    // Attempt to load settings
    try {
      settings = await settingRegistry.load(plugin.id);
    } catch (error) {
      console.error('Failed to load settings for nbdefense-jupyter.', error);
    }

    // Provided we were able to load application settings, create the extension widgets
    if (settings) {
      // Create the widget sidebar
      const nbdefensePlugin = new NBDefenseWidget(notebookTracker, settings);
      nbdefensePlugin.id = 'jp-nbdefense-sessions';
      nbdefensePlugin.title.icon = nbdefenseIcon;
      nbdefensePlugin.title.caption = 'NBDefense';

      // Let the application restorer track the running panel for restoration of
      // application state (e.g. setting the running panel as the current side bar
      // widget).
      restorer.add(nbdefensePlugin, 'nbdefense-sessions');

      // Rank has been chosen somewhat arbitrarily to give priority to the running
      // sessions widget in the sidebar.
      app.shell.add(nbdefensePlugin, 'left', { rank: 200 });

      // Add notebook toolbar buttons
      app.docRegistry.addWidgetExtension(
        'Notebook',
        new ButtonExtension(nbdefensePlugin, app.shell)
      );

      app.docRegistry.addWidgetExtension(
        'Notebook',
        new SwitchExtension(nbdefensePlugin, app.shell, settings)
      );
    }
  }
};

export default plugin;
