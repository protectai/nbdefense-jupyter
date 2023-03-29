import React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Widget } from '@lumino/widgets';
import { ISignal, Signal } from '@lumino/signaling';

import NBDefensePanel from '../components/NBDefensePanel';
import { nbdefenseWidgetStyle } from '../style/NBDefenseWidgetStyle';
import {
  SETTING_CONTEXTUAL_HELP_KEY,
  SETTING_DROPDOWN_KEY
} from '../constants';

export class NBDefenseWidget extends ReactWidget {
  constructor(
    notebookTracker: INotebookTracker,
    settings: ISettingRegistry.ISettings,
    options?: Widget.IOptions
  ) {
    super(options);
    this.node.id = 'NBDefenseSession-root';
    this.addClass(nbdefenseWidgetStyle);

    this._notebookTracker = notebookTracker;
    this._settings = settings;

    this._runScanSignal = new Signal(this);

    this._isContextualHelpVisible =
      (settings.get(SETTING_CONTEXTUAL_HELP_KEY).composite as boolean) || false;
    this._isNBDefenseDropdownVisible =
      (settings.get(SETTING_DROPDOWN_KEY).composite as boolean) || false;
  }

  render(): JSX.Element {
    console.log('@settings', this._settings);
    return (
      <>
        <NBDefensePanel
          notebookTracker={this._notebookTracker}
          runScanSignal={this.runScanSignal}
          isContextualHelpVisible={this._isContextualHelpVisible}
          isNBDefenseDropdownVisible={this._isNBDefenseDropdownVisible}
          settings={this._settings}
        />
      </>
    );
  }

  private _notebookTracker: INotebookTracker;
  private _settings: ISettingRegistry.ISettings;
  private _runScanSignal: Signal<NBDefenseWidget, void>;
  private _isContextualHelpVisible: boolean;
  private _isNBDefenseDropdownVisible: boolean;

  public get runScanSignal(): ISignal<NBDefenseWidget, void> {
    return this._runScanSignal;
  }

  runScan(): void {
    this._runScanSignal.emit();
  }

  setContextualHelpVisible(isVisible: boolean): void {
    this._isContextualHelpVisible = isVisible;
    this.update();
  }

  setNBDefenseDropdownVisible(isVisible: boolean): void {
    this._isNBDefenseDropdownVisible = isVisible;
    this.update();
  }
}
