import React from 'react';
import {
  INotebookModel,
  INotebookTracker,
  Notebook,
  NotebookPanel
} from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ScannedNotebook } from '../types';

export const useCurrentNotebook = ({
  notebookTracker
}: {
  notebookTracker: INotebookTracker;
}): ScannedNotebook => {
  const [currentNotebookPath, setCurrentNotebookPath] = React.useState<
    string | undefined
  >(undefined);
  const [currentNotebookModel, setCurrentNotebookModel] = React.useState<
    INotebookModel | null | undefined
  >(undefined);
  const [currentNotebook, setCurrentNotebook] = React.useState<
    Notebook | undefined
  >(undefined);
  const [currentNotebookContext, setCurrentNoteBookContext] = React.useState<
    DocumentRegistry.IContext<INotebookModel> | undefined
  >(undefined);

  React.useEffect(() => {
    notebookTracker.currentChanged.connect(
      (sender: INotebookTracker, args: NotebookPanel | null) => {
        if (args === null || currentNotebookPath !== args?.context.path) {
          setCurrentNotebook(args?.content);
          setCurrentNotebookModel(args?.model);

          // Update context, current path, and track for path change
          if (args?.context) {
            currentNotebookContext?.pathChanged.disconnect(() => null);
            setCurrentNoteBookContext(args.context);
            setCurrentNotebookPath(args.context.path);
            args.context.pathChanged.connect(context => {
              setCurrentNotebookPath(context.path);
            });
          }
        }
      }
    );

    return () => {
      notebookTracker.currentChanged.disconnect(() => {
        setCurrentNotebookPath(undefined);
        setCurrentNotebookModel(undefined);
      });
      currentNotebookContext?.pathChanged.disconnect(() => {
        setCurrentNotebookPath(undefined);
      });
    };
  }, [notebookTracker, currentNotebookContext]);

  return {
    notebook: currentNotebook,
    notebookModel: currentNotebookModel,
    notebookPath: currentNotebookPath
  };
};
