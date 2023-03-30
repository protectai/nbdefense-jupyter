import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { NBDefenseWidget } from '../widgets/NBDefenseWidget';
import { JupyterFrontEnd } from '@jupyterlab/application';

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  nbdefenseWidget: NBDefenseWidget;
  shell: JupyterFrontEnd.IShell;

  constructor(nbdefenseWidget: NBDefenseWidget, shell: JupyterFrontEnd.IShell) {
    this.nbdefenseWidget = nbdefenseWidget;
    this.shell = shell;
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
    const openPanelAndStartScan = () => {
      this.shell.activateById(this.nbdefenseWidget.id);
      this.nbdefenseWidget.runScan();
    };
    const button = new ToolbarButton({
      className: 'nbdefense-scan-button',
      label: 'Scan with NB Defense',
      onClick: openPanelAndStartScan,
      tooltip: 'Run a scan'
    });

    panel.toolbar.insertItem(10, 'clearOutputs', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
