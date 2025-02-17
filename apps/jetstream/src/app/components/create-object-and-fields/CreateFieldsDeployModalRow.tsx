import { Badge, Icon, Spinner, Tooltip } from '@jetstream/ui';
import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';
import { CreateFieldsResults, getFriendlyStatus } from './useCreateFields';

export interface CreateFieldsDeployModalRowProps {
  result: CreateFieldsResults;
}

export const CreateFieldsDeployModalRow: FunctionComponent<CreateFieldsDeployModalRowProps> = ({ result }) => {
  const [fieldJson] = useState(() => JSON.stringify(result.field));
  const [flsErrors, setFlsErrors] = useState<string>();
  const [layoutErrors, setLayoutErrors] = useState<string>();

  useEffect(() => {
    if (Array.isArray(result.flsErrors) && result.flsErrors.length) {
      setFlsErrors(result.flsErrors.join(' ') || 'An unknown error has occurred.');
    } else if (flsErrors) {
      setFlsErrors(null);
    }
  }, [flsErrors, result.flsErrors]);

  useEffect(() => {
    if (Array.isArray(result.layoutErrors) && result.layoutErrors.length) {
      setLayoutErrors(result.layoutErrors.join(' ') || 'An unknown error has occurred.');
    } else if (layoutErrors) {
      setLayoutErrors(null);
    }
  }, [layoutErrors, result.layoutErrors]);

  return (
    <tr key={result.key} className="slds-hint-parent">
      <th scope="row">
        <div className="slds-truncate" title={result.label}>
          <Tooltip content={fieldJson}>{result.label}</Tooltip>
        </div>
        <Badge>
          {result.field.secondaryType ? `${result.field.secondaryType}: ` : ''}
          {result.field.type}
        </Badge>
      </th>
      <td className="slds-is-relative">
        {result.state === 'LOADING' && <Spinner size="x-small" />}
        <div className="slds-truncate" title={getFriendlyStatus(result)}>
          <span
            className={classNames({
              'slds-text-color_error': result.state === 'FAILED',
            })}
          >
            {getFriendlyStatus(result)}
          </span>
        </div>
      </td>
      <td className="slds-cell-wrap">
        <div className="slds-line-clamp" title={result.errorMessage || ''}>
          {result.errorMessage && (
            <Tooltip content={result.errorMessage}>
              <span className="slds-text-color_error">{result.errorMessage}</span>
            </Tooltip>
          )}
          {result.state === 'SUCCESS' && (
            <Icon
              type="utility"
              icon="success"
              description="Completed successfully"
              title="Completed successfully"
              className="slds-icon slds-icon_small slds-icon-text-success"
            />
          )}
        </div>
      </td>
      {/* FLS */}
      <td className="slds-cell-wrap">
        {result.flsErrorMessage && (
          <span className="slds-line-clamp slds-text-color_error" title={result.flsErrorMessage}>
            {result.flsErrorMessage}
          </span>
        )}
        {result.state === 'SUCCESS' && !result.flsWarning && result.flsResult && (
          <Icon
            type="utility"
            icon="success"
            description="Completed successfully"
            title="Completed successfully"
            className="slds-icon slds-icon_small slds-icon-text-success"
          />
        )}
        {result.state === 'SUCCESS' && result.flsWarning && result.flsResult && (
          <Tooltip content={flsErrors}>
            <Icon
              type="utility"
              icon="warning"
              description="Completed with errors"
              title="Completed with errors"
              className="slds-icon slds-icon_small slds-icon-text-warning"
            />
          </Tooltip>
        )}
        {result.state === 'SUCCESS' && !result.flsResult && <span>N/A</span>}
      </td>
      {/* PAGE LAYOUTS */}
      <td className="slds-cell-wrap">
        {result.state === 'SUCCESS' && result.pageLayoutStatus === 'SUCCESS' && (
          <Icon
            type="utility"
            icon="success"
            description="Page Layouts Updated Successfully"
            title="Page Layouts Updated Successfully"
            className="slds-icon slds-icon_small slds-icon-text-success"
          />
        )}
        {result.state === 'SUCCESS' && result.pageLayoutStatus === 'PARTIAL' && (
          <Tooltip content={layoutErrors}>
            <Icon
              type="utility"
              icon="warning"
              description="Completed with errors"
              title="Completed with errors"
              className="slds-icon slds-icon_small slds-icon-text-warning"
            />
          </Tooltip>
        )}
        {result.state === 'SUCCESS' && result.pageLayoutStatus === 'FAILED' && (
          <Tooltip content={layoutErrors}>
            <Icon
              type="utility"
              icon="error"
              description="Failed"
              title="Failed"
              className="slds-icon slds-icon_small slds-icon-text-error"
            />
          </Tooltip>
        )}
        {result.state === 'SUCCESS' && result.pageLayoutStatus === 'SKIPPED' && <span>N/A</span>}
      </td>
    </tr>
  );
};

export default CreateFieldsDeployModalRow;
