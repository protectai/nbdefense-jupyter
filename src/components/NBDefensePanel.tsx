import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import useEventCallback from 'use-event-callback';
import Path from 'path-browserify';

import { INotebookTracker } from '@jupyterlab/notebook';
import { Dialog } from '@jupyterlab/apputils';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ISignal } from '@lumino/signaling';

import ScanResults from './ScanResults';
import { useCurrentNotebook } from '../hooks/useCurrentNotebook';
import { useCurrentKernel } from '../hooks/useCurrentKernel';
import { useScanResults } from '../hooks/useScanResults';
import { jupyterNotebookIcon } from '../style/icons';
import { nbdefensePanelStyle } from '../style/NBDefensePanelStyle';
import LastUpdatedTime from './LastUpdatedTime';
import ScanButton from './ScanButton';
import { NBDefenseWidget } from '../widgets/NBDefenseWidget';
import NBDefenseHeader from './NBDefenseHeader';
import CurrentScanPath from './CurrentScanPath';
import DirtyStateWarning from './DirtyStateWarning';
import ErrorMessage from './ErrorMessage';
import KernelTracker from './KernelTracker';
import { getScanSettings } from '../utils/scanSettingUtils';
import { isReport, isScanError, ScanSettings } from '../types';

interface INBDefensePanelProps {
  notebookTracker: INotebookTracker;
  runScanSignal: ISignal<NBDefenseWidget, void>;
  isContextualHelpVisible: boolean;
  isNBDefenseDropdownVisible: boolean;
  settings: ISettingRegistry.ISettings;
}

const NBDefensePanel: React.FC<INBDefensePanelProps> = ({
  notebookTracker,
  runScanSignal,
  isContextualHelpVisible,
  isNBDefenseDropdownVisible,
  settings
}) => {
  const currentNotebook = useCurrentNotebook({
    notebookTracker
  });

  const [results, dispatchResults] = useScanResults({
    notebookTracker,
    isContextualHelpVisible,
    isNBDefenseDropdownVisible
  });

  const {
    notebookModel: currentNotebookModel,
    notebookPath: currentNotebookPath
  } = currentNotebook;

  const currentKernel = useCurrentKernel({
    notebookTracker: notebookTracker,
    currentNotebookPath: currentNotebookPath
  });

  const {
    kernelName: currentKernelName,
    kernelSitePackagesPath: currentKernelSitePackagesPath,
    kernelIsLoading: currentKernelIsLoading
  } = currentKernel;

  // Websockets code
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    const settings = ServerConnection.makeSettings();
    setSocketUrl(
      URLExt.join(
        settings.wsUrl,
        'nbdefense-jupyter', // API Namespace
        'scan'
      )
    );
  }, []);

  useEffect(() => {
    const report = lastJsonMessage?.report;
    if (isReport(report)) {
      dispatchResults({
        notebookPath: lastJsonMessage.notebookPath,
        type: 'report',
        report: report
      });
    }
    if (isScanError(lastJsonMessage)) {
      dispatchResults({
        notebookPath: lastJsonMessage.notebookPath,
        type: 'error',
        error: [
          {
            message:
              'An error occurred when scanning. Check that the NB Defense server extension is installed and enabled.',
            statusCode: lastJsonMessage.statusCode,
            errorType: lastJsonMessage.errorType,
            notebookPath: lastJsonMessage.notebookPath
          }
        ]
      });
    }
  }, [lastJsonMessage]);

  // Using useEventCallback because useEvent isn't implemented in React yet: https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
  const dirtyCallback = useEventCallback(() => {
    if (
      currentNotebookPath &&
      currentNotebookPath in results &&
      results[currentNotebookPath].isOpen
    ) {
      dispatchResults({
        notebookPath: currentNotebookPath,
        type: 'isDirty',
        isDirty: true
      });
    }
  });

  React.useEffect(() => {
    if (currentNotebookModel) {
      currentNotebookModel.contentChanged.disconnect(dirtyCallback);
      currentNotebookModel.contentChanged.connect(dirtyCallback);
    }
  }, [currentNotebookModel]);

  // Using useEventCallback because useEvent isn't implemented in React yet: https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
  const runScanSignalSlot = useEventCallback(() => {
    // exit without scanning if we're already running a scan
    if (
      currentNotebookPath &&
      results[currentNotebookPath] &&
      results[currentNotebookPath].isLoading
    ) {
      return;
    }

    // ensure there is a model to scan
    if (currentNotebookPath) {
      runScan();
    }
  });

  React.useEffect(() => {
    runScanSignal.disconnect(runScanSignalSlot);
    runScanSignal.connect(runScanSignalSlot);
  }, [currentNotebookPath]);

  const runScan = async () => {
    if (!currentNotebookModel) {
      await new Dialog({
        title: 'No Notebook selected',
        body: 'Cannot run scan because there is no notebook selected.',
        focusNodeSelector: 'input',
        buttons: [Dialog.cancelButton({ label: 'Close' })]
      }).launch();
      return;
    }
    if (currentNotebookModel?.dirty) {
      // TODO: change this to save the notebook instead of showing a dialog
      await new Dialog({
        title: 'Notebook has unsaved changes',
        body: 'Cannot run scan because there are unsaved changes for the selected notebook. Please save your changes and run the scan again.',
        focusNodeSelector: 'input',
        buttons: [Dialog.cancelButton({ label: 'Close' })]
      }).launch();
      return;
    }

    if (currentNotebookPath) {
      const rawSettings = settings.get('scanSettings')
        .composite as ScanSettings;
      const scanSettings = getScanSettings(rawSettings);
      // Websockets code
      dispatchResults({
        notebookPath: currentNotebookPath,
        type: 'loading',
        notebook: currentNotebook.notebook
      });
      sendJsonMessage({
        notebookPath: currentNotebookPath,
        fullNotebookPath: `${PageConfig.getOption(
          'serverRoot'
        )}/${currentNotebookPath}`,
        sitePackagesPath: currentKernelSitePackagesPath,
        scanSettings: scanSettings
      });
    }
  };

  return (
    <>
      <NBDefenseHeader />
      <div className={nbdefensePanelStyle.wrapper}>
        {currentNotebookPath ? (
          <p className={nbdefensePanelStyle.filepath}>
            <jupyterNotebookIcon.react
              className={nbdefensePanelStyle.notebookIcon}
            />
            {Path.basename(currentNotebookPath)}
          </p>
        ) : null}
        <CurrentScanPath notebookPath={currentNotebookPath} />
        {currentNotebookPath && (
          <KernelTracker
            kernelName={currentKernelName}
            sitePackagesPath={currentKernelSitePackagesPath}
            loading={currentKernelIsLoading}
          />
        )}
        <LastUpdatedTime results={results} notebookPath={currentNotebookPath} />
        {currentNotebookPath &&
          results[currentNotebookPath] &&
          results[currentNotebookPath].isDirty && <DirtyStateWarning />}
        <ScanButton
          isLoading={
            currentNotebookPath !== undefined &&
            currentNotebookPath in results &&
            results[currentNotebookPath].isLoading
          }
          onClick={runScan}
          scanExists={!!(currentNotebookPath && results[currentNotebookPath])}
        />
        {currentNotebookPath && results[currentNotebookPath] && (
          <>
            {!results[currentNotebookPath].isLoading &&
              results[currentNotebookPath].report && (
                <ScanResults
                  scannedNotebook={currentNotebook}
                  results={results[currentNotebookPath].report}
                  scanHasErrors={
                    (results[currentNotebookPath].error?.length || 0) > 0
                  }
                />
              )}
            <ErrorMessage errors={results[currentNotebookPath].error} />
          </>
        )}
        {currentNotebookPath &&
          results[currentNotebookPath] &&
          Object.values(results[currentNotebookPath].portals).flat(1)}
      </div>
    </>
  );
};

export default NBDefensePanel;
