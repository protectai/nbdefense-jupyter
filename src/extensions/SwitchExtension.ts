import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { Switch } from '@jupyterlab/ui-components';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { NBDefenseWidget } from '../widgets/NBDefenseWidget';
import {
  SETTING_CONTEXTUAL_HELP_KEY,
  SETTING_DROPDOWN_KEY
} from '../constants';

export class SwitchExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  nbdefenseWidget: NBDefenseWidget;
  shell: JupyterFrontEnd.IShell;
  settings: ISettingRegistry.ISettings;

  constructor(
    nbdefenseWidget: NBDefenseWidget,
    shell: JupyterFrontEnd.IShell,
    settings: ISettingRegistry.ISettings
  ) {
    this.nbdefenseWidget = nbdefenseWidget;
    this.shell = shell;
    this.settings = settings;
  }

  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const toggleShowContextualHelp = (event: Event) => {
      switch (event.type) {
        case 'click':
          showContextualHelp.value = !showContextualHelp.value;
          this.settings.set(
            SETTING_CONTEXTUAL_HELP_KEY,
            showContextualHelp.value
          );
          this.nbdefenseWidget.setContextualHelpVisible(
            showContextualHelp.value
          );
          break;
        default:
          break;
      }
    };

    const toggleShowNBDefenseDropdown = (event: Event) => {
      switch (event.type) {
        case 'click':
          showNBDefenseDropdown.value = !showNBDefenseDropdown.value;
          this.settings.set(SETTING_DROPDOWN_KEY, showNBDefenseDropdown.value);
          this.nbdefenseWidget.setNBDefenseDropdownVisible(
            showNBDefenseDropdown.value
          );
          break;
        default:
          break;
      }
    };

    this.settings.changed.connect(() => {
      showContextualHelp.value =
        (this.settings.get(SETTING_CONTEXTUAL_HELP_KEY).composite as boolean) ||
        false;
      showNBDefenseDropdown.value =
        (this.settings.get(SETTING_DROPDOWN_KEY).composite as boolean) || false;
    });

    const showContextualHelp = new Switch();
    showContextualHelp.label = 'Contextual Help';
    showContextualHelp.value =
      (this.settings.get(SETTING_CONTEXTUAL_HELP_KEY).composite as boolean) ||
      false;
    showContextualHelp.addClass('nbdefense-toolbar-switch');
    showContextualHelp.handleEvent = toggleShowContextualHelp;

    const showNBDefenseDropdown = new Switch();
    showNBDefenseDropdown.label = 'NB Defense Dropdowns';
    showNBDefenseDropdown.value =
      (this.settings.get(SETTING_DROPDOWN_KEY).composite as boolean) || false;
    showNBDefenseDropdown.addClass('nbdefense-toolbar-switch');
    showNBDefenseDropdown.handleEvent = toggleShowNBDefenseDropdown;

    panel.toolbar.insertItem(11, 'ShowContextualHelp', showContextualHelp);
    panel.toolbar.insertItem(
      12,
      'showNBDefenseDropdows',
      showNBDefenseDropdown
    );
    return new DisposableDelegate(() => {
      showContextualHelp.dispose();
      showNBDefenseDropdown.dispose();
    });
  }
}
