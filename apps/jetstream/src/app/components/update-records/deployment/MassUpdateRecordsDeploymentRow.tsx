import { logger } from '@jetstream/shared/client-logger';
import { ANALYTICS_KEYS } from '@jetstream/shared/constants';
import { bulkApiGetRecords } from '@jetstream/shared/data';
import { formatNumber } from '@jetstream/shared/ui-utils';
import { pluralizeFromNumber } from '@jetstream/shared/utils';
import { BulkJobBatchInfo, BulkJobResultRecord, SalesforceOrgUi } from '@jetstream/types';
import { Card, FileDownloadModal, Grid, SalesforceLogin, ScopedNotification, Spinner, SupportLink } from '@jetstream/ui';
import { Fragment, FunctionComponent, useState } from 'react';
import { useRecoilState } from 'recoil';
import { applicationCookieState } from '../../../app-state';
import { useAmplitude } from '../../core/analytics';
import * as fromJetstreamEvents from '../../core/jetstream-events';
import LoadRecordsResultsModal from '../../load-records/components/load-results/LoadRecordsResultsModal';
import { DownloadAction, DownloadType } from '../../shared/load-records-results/load-records-results-types';
import LoadRecordsBulkApiResultsTable from '../../shared/load-records-results/LoadRecordsBulkApiResultsTable';
import { MetadataRow } from '../mass-update-records.types';
import { getFieldsToQuery } from '../mass-update-records.utils';
import MassUpdateRecordTransformationText from '../shared/MassUpdateRecordTransformationText';

export interface DownloadModalData {
  open: boolean;
  data: any[];
  header: string[];
  fileNameParts: string[];
}

export interface ViewModalData extends Omit<DownloadModalData, 'fileNameParts'> {
  type: DownloadType;
}

export interface MassUpdateRecordsDeploymentRowProps {
  selectedOrg: SalesforceOrgUi;
  row: MetadataRow;
  batchSize: number;
}

export const MassUpdateRecordsDeploymentRow: FunctionComponent<MassUpdateRecordsDeploymentRowProps> = ({ selectedOrg, row, batchSize }) => {
  const { trackEvent } = useAmplitude();
  const [downloadModalData, setDownloadModalData] = useState<DownloadModalData>({ open: false, data: [], header: [], fileNameParts: [] });
  const [resultsModalData, setResultsModalData] = useState<ViewModalData>({ open: false, data: [], header: [], type: 'results' });
  const [{ serverUrl, google_apiKey, google_appId, google_clientId }] = useRecoilState(applicationCookieState);

  const { done, processingErrors, status, jobInfo, processingEndTime, processingStartTime } = row.deployResults;

  async function handleDownloadOrViewRecords(
    action: DownloadAction,
    type: DownloadType,
    batch: BulkJobBatchInfo,
    batchIndex: number
  ): Promise<void> {
    try {
      // if (downloadError) {
      // setDownloadError(null);
      // }
      const data = await bulkApiGetRecords<BulkJobResultRecord>(selectedOrg, jobInfo.id, batch.id, 'result');

      const startIdx = row.deployResults.batchIdToIndex[batch.id] * batchSize;

      const records: any[] = row.deployResults.records.slice(startIdx, startIdx + batchSize);
      const combinedResults = [];

      data.forEach((resultRecord, i) => {
        // show all if results, otherwise just include errors
        if (type === 'results' || !resultRecord.Success) {
          combinedResults.push({
            _id: resultRecord.Id || records[i].Id || null,
            _success: resultRecord.Success,
            _errors: resultRecord.Error,
            ...records[i],
          });
        }
      });

      const header = ['_id', '_success', '_errors'].concat(getFieldsToQuery(row));

      if (action === 'view') {
        setResultsModalData({ ...downloadModalData, open: true, header, data: combinedResults, type });
        trackEvent(ANALYTICS_KEYS.mass_update_DownloadRecords, {
          type,
          numRows: data.length,
          transformationOptions: row.transformationOptions.option,
        });
      } else {
        setDownloadModalData({
          ...downloadModalData,
          open: true,
          fileNameParts: ['mass-load'.toLocaleLowerCase(), row.sobject.toLocaleLowerCase(), type],
          header,
          data: combinedResults,
        });
        trackEvent(ANALYTICS_KEYS.mass_update_ViewRecords, {
          type,
          numRows: data.length,
          transformationOptions: row.transformationOptions.option,
        });
      }
    } catch (ex) {
      logger.warn(ex);
      // setDownloadError(ex.message);
    }
  }

  function handleDownloadProcessingErrors() {
    const header = ['_id', '_success', '_errors'].concat(getFieldsToQuery(row));
    setDownloadModalData({
      ...downloadModalData,
      open: true,
      fileNameParts: ['mass-load'.toLocaleLowerCase(), row.sobject.toLocaleLowerCase(), 'processing-failures'],
      header,
      data: row.deployResults.processingErrors.map((error) => ({
        _id: null,
        _success: false,
        _errors: error.errors.join('\n'),
        ...error.record,
      })),
    });
  }

  function handleDownloadRecordsFromModal(type: 'results' | 'failures', data: any[]) {
    const header = ['_id', '_success', '_errors'].concat(getFieldsToQuery(row));
    setResultsModalData({ ...resultsModalData, open: false });
    setDownloadModalData({
      open: true,
      data,
      header,
      fileNameParts: ['mass-load'.toLocaleLowerCase(), row.sobject.toLocaleLowerCase(), type],
    });
    trackEvent(ANALYTICS_KEYS.mass_update_DownloadRecords, {
      type,
      numRows: data.length,
      location: 'fromViewModal',
      transformationOptions: row.transformationOptions.option,
    });
  }

  function handleModalClose() {
    setDownloadModalData({ ...downloadModalData, open: false, fileNameParts: [] });
  }

  function handleViewModalClose() {
    setResultsModalData({ open: false, data: [], header: [], type: 'results' });
  }

  return (
    <Fragment>
      {downloadModalData.open && (
        <FileDownloadModal
          org={selectedOrg}
          google_apiKey={google_apiKey}
          google_appId={google_appId}
          google_clientId={google_clientId}
          data={downloadModalData.data}
          header={downloadModalData.header}
          fileNameParts={downloadModalData.fileNameParts}
          onModalClose={handleModalClose}
          emitUploadToGoogleEvent={fromJetstreamEvents.emit}
        />
      )}
      {resultsModalData.open && (
        <LoadRecordsResultsModal
          type={resultsModalData.type}
          header={resultsModalData.header}
          rows={resultsModalData.data}
          onDownload={handleDownloadRecordsFromModal}
          onClose={handleViewModalClose}
        />
      )}

      <Card
        bodyClassName={null}
        nestedBorder
        title={
          <Grid>
            <span>{row.sobject}</span>
            {!done && processingStartTime && <Spinner inline containerClassName="slds-m-left_medium" size="x-small" />}
          </Grid>
        }
        footer={<MassUpdateRecordTransformationText selectedField={row.selectedField} transformationOptions={row.transformationOptions} />}
      >
        {!processingStartTime && (
          <div className="slds-m-left_medium">
            When validated,{' '}
            <span className="text-bold">
              {formatNumber(row.validationResults.impactedRecords)} {pluralizeFromNumber('record', row.validationResults.impactedRecords)}
            </span>{' '}
            were found matching this criteria.
          </div>
        )}
        <div>
          <div className="text-bold slds-m-left_medium">{status}</div>
          {jobInfo?.id && (
            <SalesforceLogin
              className="slds-m-left_medium"
              serverUrl={serverUrl}
              org={selectedOrg}
              returnUrl={`/lightning/setup/AsyncApiJobStatus/page?address=%2F${jobInfo.id}`}
              iconPosition="right"
            >
              View job in Salesforce
            </SalesforceLogin>
          )}
          {Array.isArray(jobInfo?.batches) && (
            <LoadRecordsBulkApiResultsTable
              jobInfo={jobInfo}
              processingErrors={processingErrors}
              processingStartTime={processingStartTime}
              processingEndTime={processingEndTime}
              onDownloadOrView={handleDownloadOrViewRecords}
              onDownloadProcessingErrors={handleDownloadProcessingErrors}
            />
          )}
        </div>
        {done && !jobInfo && status !== 'Error' && (
          <ScopedNotification theme="info" className="slds-m-around_small">
            No records met criteria
          </ScopedNotification>
        )}
        {status === 'Error' && (
          <ScopedNotification theme="error" className="slds-m-around_small">
            <SupportLink />
          </ScopedNotification>
        )}
      </Card>
    </Fragment>
  );
};

export default MassUpdateRecordsDeploymentRow;
