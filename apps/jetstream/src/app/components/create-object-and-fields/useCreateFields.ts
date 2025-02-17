import { logger } from '@jetstream/shared/client-logger';
import { genericRequest, sobjectOperation } from '@jetstream/shared/data';
import { useBrowserNotifications, useRollbar } from '@jetstream/shared/ui-utils';
import { getMapOf, getSuccessOrFailureChar, pluralizeFromNumber, REGEX, splitArrayToMaxSize } from '@jetstream/shared/utils';
import { CompositeGraphResponseBodyData, CompositeResponse, ErrorResult, MapOf, RecordResult, SalesforceOrgUi } from '@jetstream/types';
import { useCallback, useEffect, useState } from 'react';
import { FieldDefinitionMetadata, FieldPermissionRecord, FieldValues, SalesforceFieldType } from './create-fields-types';
import { deployLayouts, getFieldPermissionRecords, prepareCreateFieldsCompositeRequests, preparePayload } from './create-fields-utils';

export interface CreateFieldsResults {
  key: string;
  label: string;
  field: FieldDefinitionMetadata;
  state: CreateFieldsResultsStatus;
  operation: 'INSERT' | 'UPSERT';
  errorMessage?: string;
  flsErrorMessage?: string;
  flsWarning?: boolean;
  deployResult?: any;
  flsRecords?: FieldPermissionRecord[];
  flsResult?: RecordResult[];
  flsErrors?: string[];
  pageLayoutStatus?: 'SKIPPED' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  layoutErrors?: string[];
  updatedLayoutIds?: string[];
}

export type CreateFieldsResultsStatus = 'NOT_STARTED' | 'LOADING' | 'SUCCESS' | 'FAILED';

export function getFriendlyStatus(result: CreateFieldsResults) {
  switch (result.state) {
    case 'NOT_STARTED':
      return 'Not Deployed';
    case 'LOADING':
      return 'In Progress';
    case 'SUCCESS': {
      if (result.operation === 'UPSERT') {
        return 'Updated Successfully';
      }
      return 'Created Successfully';
    }
    case 'FAILED':
      return 'Error';
    default:
      break;
  }
}

export default function useCreateFields({
  apiVersion,
  serverUrl,
  selectedOrg,
  profiles,
  permissionSets,
  sObjects,
  rows,
}: {
  apiVersion: string;
  serverUrl: string;
  selectedOrg: SalesforceOrgUi;
  profiles: string[];
  permissionSets: string[];
  sObjects: string[];
  rows: FieldValues[];
}) {
  const rollbar = useRollbar();
  const { notifyUser } = useBrowserNotifications(serverUrl, window.electron?.isFocused);
  const [loading, setLoading] = useState(false);
  const [_results, setResults] = useState<CreateFieldsResults[]>([]);
  const [resultsById, setResultsById] = useState<MapOf<CreateFieldsResults>>({});
  const [fatalError, setFatalError] = useState(false);
  const [fatalErrorMessage, setFatalErrorMessage] = useState<string>();
  const [layoutErrorMessage, setLayoutErrorMessage] = useState<string>();
  const [deployed, setDeployed] = useState(false);

  useEffect(() => {
    if (rows) {
      try {
        const payload: CreateFieldsResults[] = preparePayload(sObjects, rows).map((field) => ({
          key: `${(field.fullName as string).replace('.', '_').replace(REGEX.CONSECUTIVE_UNDERSCORES, '_')}`,
          label: field.fullName,
          field,
          state: 'NOT_STARTED',
          operation: 'INSERT',
        }));
        setResultsById(getMapOf(payload, 'key'));
        logger.log('[DEPLOY FIELDS][PAYLOADS]', payload);
      } catch (ex) {
        setFatalError(true);
        setFatalErrorMessage('There was a problem preparing the data for deployment');
        rollbar.critical('Create fields - prepare payload error', {
          message: ex.message,
          stack: ex.stack,
        });
      }
    }
  }, [rollbar, rows, sObjects]);

  useEffect(() => {
    if (resultsById) {
      setResults(Object.values(resultsById));
    }
    logger.log({ resultsById });
  }, [resultsById]);

  /**
   * DEPLOY FIELD METADATA
   */
  const deployFieldMetadata = useCallback(
    async (_resultsById: MapOf<CreateFieldsResults>, permissionRecords: FieldPermissionRecord[]) => {
      setFatalErrorMessage(null);
      setLayoutErrorMessage(null);
      setFatalError(false);

      const createFieldsPayloads = await prepareCreateFieldsCompositeRequests(
        selectedOrg,
        sObjects,
        apiVersion,
        Object.values(_resultsById)
      );

      for (const compositeRequest of createFieldsPayloads) {
        const response = await genericRequest<CompositeResponse<CompositeGraphResponseBodyData | CompositeGraphResponseBodyData[]>>(
          selectedOrg,
          {
            isTooling: true,
            method: 'POST',
            url: `/services/data/${apiVersion}/tooling/composite`,
            body: compositeRequest,
          }
        );

        response.compositeResponse.forEach(({ body, httpStatusCode, referenceId }) => {
          _resultsById[referenceId] = { ..._resultsById[referenceId] };
          _resultsById[referenceId].errorMessage = null;
          if (body) {
            _resultsById[referenceId].deployResult = body;
          }
          if (httpStatusCode < 200 || httpStatusCode > 299) {
            let errorMessage: string;
            // errors seem to be returned as an array, success is returned as an object
            if (Array.isArray(body)) {
              errorMessage = body.map(({ message }) => message).join(' ');
            } else {
              errorMessage = body.message;
            }
            _resultsById[referenceId].errorMessage = errorMessage || 'An unknown error has occurred.';
            _resultsById[referenceId].state = 'FAILED';
          } else {
            // If UPSERT, there is no body to store and we do not want to re-create the permissions as it will fail
            if (httpStatusCode === 204) {
              _resultsById[referenceId].operation = 'UPSERT';
            } else {
              _resultsById[referenceId].deployResult = (body as CompositeGraphResponseBodyData).id;

              // required fields and master detail cannot have FLS set
              if (!_resultsById[referenceId].field.required && _resultsById[referenceId].field.type !== 'MasterDetail') {
                getFieldPermissionRecords(
                  _resultsById[referenceId].field.fullName,
                  _resultsById[referenceId].field.formula ? 'Formula' : (_resultsById[referenceId].field.type as SalesforceFieldType),
                  profiles,
                  permissionSets
                ).forEach((record) => permissionRecords.push(record));
              }
            }
          }
        });
      }
    },
    [apiVersion, permissionSets, profiles, selectedOrg]
  );

  /**
   * DEPLOY FIELD PERMISSIONS
   */
  const deployFieldPermissions = useCallback(
    async (_resultsById: MapOf<CreateFieldsResults>, permissionRecords: FieldPermissionRecord[]) => {
      try {
        const permissionResults: RecordResult[] = (
          await Promise.all(
            splitArrayToMaxSize(permissionRecords, 200).map((records) =>
              sobjectOperation(selectedOrg, 'FieldPermissions', 'create', { records }, { allOrNone: false })
            )
          )
        ).flat();
        const resultsByFullName: MapOf<CreateFieldsResults> = Object.keys(_resultsById).reduce((output, key) => {
          const fullName: string = _resultsById[key].field.fullName;
          output[fullName] = _resultsById[key];
          return output;
        }, {});
        permissionResults.forEach((record, i) => {
          const originalRecord = permissionRecords[i];
          originalRecord.Success = record.success;
          if (resultsByFullName[originalRecord?.Field]) {
            const result = resultsByFullName[originalRecord?.Field];
            result.flsRecords = permissionRecords;
            result.flsResult = result.flsResult || [];
            result.flsResult.push(record);
            if (!record.success) {
              result.flsWarning = true;
              try {
                result.flsErrors = (record as ErrorResult).errors.map((error) => error.message);
                originalRecord.Errors = result.flsErrors.join('\n');
              } catch (ex) {
                logger.warn('Error getting FLS errors');
                rollbar.error('Create fields - error getting FLS results', {
                  message: ex.message,
                  stack: ex.stack,
                });
              }
            } else {
              originalRecord.Id = record.id;
            }
          }
        });
      } catch (ex) {
        Object.values(_resultsById).forEach((result) => {
          result.flsErrorMessage = 'An unknown error has occurred.';
        });
      }
    },
    [rollbar, selectedOrg]
  );

  /**
   * PUBLIC
   * DEPLOY FIELD METADATA AND PERMISSIONS
   */
  const deployFields = useCallback(
    async (results: CreateFieldsResults[], selectedLayoutIds: string[]) => {
      try {
        setLoading(true);

        let _resultsById: MapOf<CreateFieldsResults> = getMapOf(
          results.map((result) => ({ ...result, state: 'LOADING' })),
          'key'
        );
        const permissionRecords: FieldPermissionRecord[] = [];

        setResultsById(_resultsById);

        _resultsById = { ..._resultsById };

        /** DEPLOY FIELD METADATA */

        await deployFieldMetadata(_resultsById, permissionRecords);

        setResultsById(_resultsById);

        _resultsById = { ..._resultsById };

        /** PERMISSIONS (Profiles/Permission Sets) */

        if (permissionRecords.length) {
          await deployFieldPermissions(_resultsById, permissionRecords);
        }

        const deployedFields = Object.values(_resultsById)
          .filter(({ state }) => state === 'LOADING')
          .map(({ field }) => field);

        /** PAGE LAYOUTS */
        let pageLayoutStatus: 'SKIPPED' | 'SUCCESS' | 'PARTIAL' | 'FAILED' = 'SKIPPED';
        let _layoutErrors: string[] = [];
        let _updatedLayoutIds: string[] = [];
        if (deployedFields.length && selectedLayoutIds.length) {
          try {
            const { updatedLayoutIds, errors: layoutErrors } = await deployLayouts(
              apiVersion,
              selectedOrg,
              selectedLayoutIds,
              deployedFields
            );
            if (layoutErrors.length) {
              setLayoutErrorMessage(layoutErrors.join(' '));
            }
            if (layoutErrors.length && !updatedLayoutIds.length) {
              pageLayoutStatus = 'FAILED';
            } else if (layoutErrors.length) {
              pageLayoutStatus = 'PARTIAL';
            } else {
              pageLayoutStatus = 'SUCCESS';
            }
            _layoutErrors = layoutErrors;
            _updatedLayoutIds = updatedLayoutIds;
          } catch (ex) {
            setLayoutErrorMessage('There was an unexpected error updating page layouts');
            pageLayoutStatus = 'FAILED';
            rollbar.error('Create fields - page layouts - error', {
              message: ex.message,
              stack: ex.stack,
            });
          }
        }

        Object.values(_resultsById).forEach((result) => {
          if (result.state === 'LOADING') {
            result.state = 'SUCCESS';
            result.pageLayoutStatus = pageLayoutStatus;
            result.layoutErrors = _layoutErrors;
            result.updatedLayoutIds = _updatedLayoutIds;
          }
        });

        logger.log('[DEPLOY FINISHED]', _resultsById);
        setResultsById(_resultsById);
        setDeployed(true);
        sendBrowserNotification(_resultsById);
      } catch (ex) {
        logger.log('[DEPLOY FAILED]', ex);
        setFatalError(true);
        setFatalErrorMessage(`An unexpected error has occurred. ${ex.message}`);
        setResultsById(
          getMapOf(
            results.map((result) => (result.state === 'LOADING' ? { ...result, state: 'FAILED' } : result)),
            'key'
          )
        );
        rollbar.error('Create fields error', {
          message: ex.message,
          stack: ex.stack,
        });
        notifyUser(`There was an error deploying your fields`, {
          body: `An unexpected error has occurred. ${ex.message}`,
          tag: 'create-fields',
        });
      } finally {
        setLoading(false);
      }
    },
    [apiVersion, deployFieldMetadata, deployFieldPermissions, rollbar, selectedOrg]
  );

  function sendBrowserNotification(resultsById: MapOf<CreateFieldsResults>) {
    const { fieldErrors, fieldSuccess, deployedFls, flsErrors, deployedLayouts, layoutErrors } = Object.values(resultsById).reduce(
      (output, field) => {
        if (field.state === 'SUCCESS') {
          output.fieldSuccess += 1;
        } else {
          output.fieldErrors += 1;
        }
        if (field.flsErrors?.length) {
          output.flsErrors = true;
        } else if (field.flsResult?.length) {
          output.deployedFls = true;
        }
        if (field.layoutErrors?.length) {
          output.layoutErrors = true;
        } else if (field.flsResult?.length) {
          output.deployedLayouts = true;
        }
        return output;
      },
      {
        fieldSuccess: 0,
        fieldErrors: 0,
        flsErrors: false,
        deployedFls: false,
        layoutErrors: false,
        deployedLayouts: false,
      }
    );

    let body = '';
    body += `${getSuccessOrFailureChar('success', fieldSuccess)} ${fieldSuccess.toLocaleString()} ${pluralizeFromNumber(
      'field',
      fieldSuccess
    )} deployed successfully.\n`;

    if (fieldErrors) {
      body += `${getSuccessOrFailureChar('failure', fieldErrors)} ${fieldErrors.toLocaleString()} ${pluralizeFromNumber(
        'field',
        fieldErrors
      )} failed to deploy.\n`;
    }

    if (flsErrors) {
      body += `${getSuccessOrFailureChar('failure', 1)} There were problems updating field level security.\n`;
    } else if (deployedFls) {
      body += `${getSuccessOrFailureChar('success', 1)} Field level security updated successfully.\n`;
    }

    if (layoutErrors) {
      body += `${getSuccessOrFailureChar('failure', 1)} There were problems updating page layouts.`;
    } else if (deployedLayouts) {
      body += `${getSuccessOrFailureChar('success', 1)} Page layouts updated successfully.`;
    }

    notifyUser(`Your field deployment has finished`, { body, tag: 'create-fields' });
  }

  return { results: _results, loading, deployed, fatalError, fatalErrorMessage, layoutErrorMessage, deployFields };
}
