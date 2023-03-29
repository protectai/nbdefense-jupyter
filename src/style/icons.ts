import { LabIcon } from '@jupyterlab/ui-components';

import nbdefenseSvg from '../../style/icons/nbdefense.svg';
import loadingSvg from '../../style/icons/loading.svg';
import caretSvg from '../../style/icons/caret.svg';
import noIssuesFoundSvg from '../../style/icons/no-issues-found.svg';
import alertCircleSvg from '../../style/icons/alert-circle.svg';
import exclamationSvg from '../../style/icons/exclamation.svg';
import exclamationRedSvg from '../../style/icons/exclamation-red.svg';
import headerNBDefenseShieldSvg from '../../style/icons/header-nbdefense-shield.svg';
import headerBackgroundSvg from '../../style/icons/header-background.svg';
import jupyterNotebookSvg from '../../style/icons/jupyter-notebook.svg';

export const nbdefenseIcon = new LabIcon({
  name: 'nbdefense',
  svgstr: nbdefenseSvg
});

export const loadingIcon = new LabIcon({ name: 'loading', svgstr: loadingSvg });

export const caretIcon = new LabIcon({ name: 'caret', svgstr: caretSvg });

export const exclamationIcon = new LabIcon({
  name: 'exclamation',
  svgstr: exclamationSvg
});

export const noIssuesFoundIcon = new LabIcon({
  name: 'no issues found',
  svgstr: noIssuesFoundSvg
});

export const alertCircleIcon = new LabIcon({
  name: 'alert',
  svgstr: alertCircleSvg
});

export const headerNBDefenseShieldIcon = new LabIcon({
  name: 'nbdefense header shield',
  svgstr: headerNBDefenseShieldSvg
});

export const headerBackground = new LabIcon({
  name: 'header background',
  svgstr: headerBackgroundSvg
});

export const jupyterNotebookIcon = new LabIcon({
  name: 'jupyter notebook',
  svgstr: jupyterNotebookSvg
});

export const exclamationRedIcon = new LabIcon({
  name: 'exclamation red',
  svgstr: exclamationRedSvg
});
