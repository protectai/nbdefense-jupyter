import { INotebookModel, Notebook } from '@jupyterlab/notebook';

export type ReportError = {
  error_type: string;
  plugin_name: string;
  message: string;
};

export type Report = {
  root: string;
  notebook_issues: Array<Issues>;
  errors: Array<ReportError>;
};

export const isReport = (report?: unknown): report is Report => {
  const typedReport = report as Report;
  return (
    typedReport &&
    typedReport.root !== undefined &&
    typeof typedReport.root === 'string' &&
    typedReport.notebook_issues !== undefined &&
    Array.isArray(typedReport.notebook_issues)
  );
};

export type Issues = {
  /**
   * The path to the notebook this scan was run on
   */
  path: string;

  issues: Array<Issue>;
};

export type Issue = {
  code: IssueCode;
  cell: NBDefenseCell | NBDefenseOutputCell;
  location: IssueLocation;
  severity: Severity;
  details?: IssueDetails;
};

export type LineCellIssue = {
  character_start_index: number;
  character_end_index: number;
  line_index: number;
} & Issue;

export type DataframeCellIssue = {
  row_index: number;
  column_index: number;
} & Issue;

export type AggregateCellIssue = {
  issues: Array<Issue>;
} & Issue;

export const isLineCellIssue = (issue: Issue): issue is LineCellIssue =>
  'character_start_index' in issue &&
  'character_end_index' in issue &&
  'line_index' in issue;

export const isDataframeCellIssue = (
  issue: Issue
): issue is DataframeCellIssue =>
  'row_index' in issue && 'column_index' in issue;

export const isAggregateCellIssue = (
  issue: Issue
): issue is AggregateCellIssue => 'issues' in issue;

export type NBDefenseCell = {
  cell_index: number;
  cell_type: CellType;
  scrubbed_content: string;
};

export type NBDefenseOutputCell = {
  cell_index: number;
  cell_type: CellType;
  scrubbed_content: string;
  output_index: number;
};

export type IssueDetails = {
  description?: string;
  summary_field?: { [key: string]: number };
};

export enum IssueCode {
  SECRETS = 'SECRETS',
  PII_FOUND = 'PII_FOUND',
  UNAPPROVED_LICENSE = 'UNAPPROVED_LICENSE_IMPORT',
  VULNERABLE_DEPENDENCY = 'VULNERABLE_DEPENDENCY_IMPORT'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  ANY = 'ANY'
}

export enum IssueLocation {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export enum CellType {
  SOURCE = 'SOURCE',
  MARKDOWN = 'MARKDOWN',
  STREAM = 'STREAM',
  PLAINTEXT = 'PLAINTEXT',
  DATAFRAME = 'DATAFRAME'
}

export type ScannedNotebook = {
  notebook?: Notebook | undefined;
  notebookModel: INotebookModel | null | undefined;
  notebookPath?: string | undefined;
};

export type KernelInfo = {
  kernelName: string | undefined;
  kernelSitePackagesPath: string | undefined;
  kernelIsLoading: boolean;
};

export enum ScanErrorType {
  UNKNOWN_ISSUE = 'UNKNOWN_ISSUE',
  HTTP_ERROR = 'HTTPError',
  PYTHON_EXCEPTION = 'Exception'
}

export type ScanError = {
  errorType: ScanErrorType;
  notebookPath: string;
  statusCode: number;
  message: string;
};

export enum MessageLevel {
  WARN = 'warn',
  ERROR = 'error'
}

export type CVENotebookPluginSettings = {
  enabled: boolean;
};

export type LicenseNotebookPluginSettings = {
  enabled: boolean;
  licenses_for_notebooks_source: string;
  accepted_licenses: Array<string>;
};

export type PIIPluginSettings = {
  enabled: boolean;
  confidence_threshold: number;
  entities: {
    [key: string]: boolean;
  };
};

export type RawSecretsPluginSettings = {
  [key: string]: boolean | string | number;
};

export type ModifiedSecretPluginSetting = {
  name: string;
  [key: string]: string | number;
};

export type ModifiedSecretPluginSettings = Array<ModifiedSecretPluginSetting>;

export type SecretsPluginSettings = {
  enabled: boolean;
  secrets_plugins: RawSecretsPluginSettings | ModifiedSecretPluginSettings;
};

export type PluginSettings = {
  'nbdefense.plugins.CVENotebookPlugin': CVENotebookPluginSettings;
  'nbdefense.plugins.LicenseNotebookPlugin': LicenseNotebookPluginSettings;
  'nbdefense.plugins.PIIPlugin': PIIPluginSettings;
  'nbdefense.plugins.SecretsPlugin': SecretsPluginSettings;
};

export type ScanSettings = {
  redact_secret: string;
  plugins: PluginSettings;
};

export const isScanError = (message: unknown): message is ScanError => {
  const scanError = message as ScanError;
  return (
    scanError &&
    (scanError.errorType === ScanErrorType.HTTP_ERROR ||
      scanError.errorType === ScanErrorType.PYTHON_EXCEPTION)
  );
};
