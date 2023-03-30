import React from 'react';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { KernelInfo } from '../types';
import { ISessionContext } from '@jupyterlab/apputils';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

interface IKernelReponse {
  name: string;
  text: string;
}

interface IKernelTrackerProps {
  currentNotebookPath: string | undefined;
  notebookTracker: INotebookTracker;
}

export const useCurrentKernel = ({
  currentNotebookPath,
  notebookTracker
}: IKernelTrackerProps): KernelInfo => {
  // Kernel
  const [currentSessionContext, setCurrentSessionContext] = React.useState<
    ISessionContext | undefined
  >(undefined);
  const [currentKernelIsReady, setCurrentKernelIsReady] =
    React.useState<boolean>(false);
  const [currentKernelSitePackagesPath, setCurrentKernelSitePackagesPath] =
    React.useState<string | undefined>(undefined);
  const [currentKernelName, setCurrentKernelName] = React.useState<
    string | undefined
  >(undefined);
  const [currentKernelIsLoading, setCurrentKernelIsLoading] =
    React.useState<boolean>(true);

  const getAndUpdateKernelInfo = (
    kernel: IKernelConnection | undefined | null
  ) => {
    if (kernel) {
      const getSitePackagesCode =
        'import site;print(site.getsitepackages()[0])';
      const future = kernel?.requestExecute({
        code: getSitePackagesCode
      });
      if (future) {
        future.onIOPub = (msg: any) => {
          const msgType = msg.header.msg_type;
          if (msgType === 'stream') {
            const content: IKernelReponse = <IKernelReponse>msg.content;
            if (content.text !== '\n') {
              setCurrentKernelSitePackagesPath(
                content.text.replace(/(\n|)/gm, '')
              );
              setCurrentKernelName(currentSessionContext?.kernelDisplayName);
            }
          }
        };
      }
    } else {
      setCurrentKernelSitePackagesPath(undefined);
      setCurrentKernelName(undefined);
    }
    setCurrentKernelIsLoading(false);
  };

  React.useEffect(() => {
    notebookTracker.currentChanged.connect(
      (sender: INotebookTracker, args: NotebookPanel | null) => {
        if (args) {
          setCurrentSessionContext(args.sessionContext);
        }
      }
    );

    return () => {
      notebookTracker.currentChanged.disconnect(() => {
        setCurrentKernelSitePackagesPath(undefined);
        setCurrentKernelName(undefined);
        setCurrentKernelIsLoading(true);
      });
    };
  }, [notebookTracker, currentSessionContext, currentKernelIsReady]);

  React.useEffect(() => {
    currentSessionContext?.statusChanged.connect(sessionContext => {
      if (sessionContext.isReady !== currentKernelIsReady) {
        setCurrentKernelIsReady(sessionContext.isReady);
      }
    });

    return () => {
      currentSessionContext?.statusChanged.disconnect(() => null);
    };
  }, [currentSessionContext, currentKernelIsReady]);

  React.useEffect(() => {
    if (
      currentKernelIsReady &&
      currentSessionContext?.path === currentNotebookPath
    ) {
      getAndUpdateKernelInfo(currentSessionContext?.session?.kernel);
    }
  }, [currentSessionContext, currentKernelIsReady, currentNotebookPath]);

  React.useEffect(() => {
    currentSessionContext?.kernelChanged.connect((e: ISessionContext) => {
      if (e.path === currentNotebookPath && currentKernelIsReady) {
        getAndUpdateKernelInfo(e.session?.kernel);
      }
    });
    return () => {
      currentSessionContext?.kernelChanged.disconnect(() => {
        setCurrentKernelSitePackagesPath(undefined);
        setCurrentKernelName(undefined);
        setCurrentKernelIsLoading(false);
      });
    };
  }, [currentSessionContext, currentNotebookPath, currentKernelIsReady]);

  return {
    kernelName: currentKernelName,
    kernelSitePackagesPath: currentKernelSitePackagesPath,
    kernelIsLoading: currentKernelIsLoading
  };
};
