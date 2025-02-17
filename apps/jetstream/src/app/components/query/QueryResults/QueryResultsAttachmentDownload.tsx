import { logger } from '@jetstream/shared/client-logger';
import { ANALYTICS_KEYS } from '@jetstream/shared/constants';
import {
  cancelZipDownload,
  DownZipFile,
  formatNumber,
  getFilename,
  getOrgUrlParams,
  getZipDownloadUrl,
  useRollbar,
} from '@jetstream/shared/ui-utils';
import { Record, SalesforceOrgUi } from '@jetstream/types';
import { Icon, Modal, ScopedNotification, Tooltip } from '@jetstream/ui';
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { useAmplitude } from '../../core/analytics';

export interface QueryResultsAttachmentDownloadProps {
  selectedOrg: SalesforceOrgUi;
  enabled: boolean;
  sobjectName: string;
  missingFields: string[];
  selectedRecords: Record[];
  hasRecords: boolean;
}

interface EnabledObjectFiledMapping {
  bodyField: string;
  nameField: string;
  sizeField: string;
}

export const FILE_DOWNLOAD_FIELD_MAP = new Map<string, EnabledObjectFiledMapping>();
FILE_DOWNLOAD_FIELD_MAP.set('attachment', { bodyField: 'Body', nameField: 'Name', sizeField: 'BodyLength' });
FILE_DOWNLOAD_FIELD_MAP.set('document', { bodyField: 'Body', nameField: 'Name', sizeField: 'BodyLength' });
FILE_DOWNLOAD_FIELD_MAP.set('contentversion', { bodyField: 'VersionData', nameField: 'PathOnClient', sizeField: 'ContentSize' });

const ROOT_FILENAME = window.electron?.isElectron ? 'jetstream-download://localhost/file/stream-download' : '/api/file/stream-download';

// TODO: duplicate files will overwrite eachother (e.x. contentversion)
function getFile(selectedOrg: SalesforceOrgUi, sobjectName: string, record: Record): DownZipFile {
  sobjectName = sobjectName.toLowerCase();
  if (FILE_DOWNLOAD_FIELD_MAP.has(sobjectName)) {
    const { bodyField, nameField, sizeField } = FILE_DOWNLOAD_FIELD_MAP.get(sobjectName);
    return {
      downloadUrl: `${ROOT_FILENAME}?${getOrgUrlParams(selectedOrg, { url: record[bodyField] })}`,
      name: record[nameField],
      size: record[sizeField],
    };
  }
  throw new Error(`Object type ${sobjectName} does not support file download.`);
}

export const QueryResultsAttachmentDownload: FunctionComponent<QueryResultsAttachmentDownloadProps> = ({
  selectedOrg,
  enabled,
  sobjectName,
  missingFields,
  selectedRecords,
  hasRecords,
}) => {
  sobjectName = sobjectName?.toLowerCase() || null;
  const rollbar = useRollbar();
  const { trackEvent } = useAmplitude();
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadAttachmentUrl, setDownloadAttachmentUrl] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disabledReason, setDisabledReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>(null);

  useEffect(() => {
    setVisible(FILE_DOWNLOAD_FIELD_MAP.has(sobjectName) && hasRecords);
    if (selectedRecords.length && !missingFields?.length) {
      setDisabled(false);
      setDisabledReason(null);
    } else if (selectedRecords.length) {
      setDisabled(true);
      setDisabledReason(`Your query must to the following fields to download attachments: ${missingFields.join(', ')}`);
    } else {
      setDisabled(true);
      setDisabledReason('Select one or more records');
    }
  }, [sobjectName, selectedRecords, missingFields, trackEvent, hasRecords]);

  useEffect(() => {
    if (visible) {
      trackEvent(ANALYTICS_KEYS.attachment_QueriedEligibleObject, { sobjectName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackEvent, visible]);

  async function handleInitiateDownload() {
    try {
      trackEvent(ANALYTICS_KEYS.attachment_ModalOpened, { selectedRecords: selectedRecords.length, sobjectName });
      setDownloadAttachmentUrl(null);
      setDisabledReason(null);
      setErrorMessage(null);
      setModalOpen(true);
      const files = selectedRecords.map((record) => getFile(selectedOrg, sobjectName, record));
      const url = await getZipDownloadUrl(getFilename(selectedOrg, [sobjectName, 'files']), files);
      setDownloadAttachmentUrl(url);
    } catch (ex) {
      logger.error('[ERROR] Attempting to get service worker url failed!');
      logger.error(ex);
      setErrorMessage('There was a problem initiating the download, your browser may not support this capability.');
      setDisabledReason('There was a problem initiating the download, your browser may not support this capability.');
      trackEvent(ANALYTICS_KEYS.attachment_Error, { selectedRecords: selectedRecords.length, sobjectName, error: ex.message });
      rollbar.error('Error initiating zip download', {
        message: ex.message,
        stack: ex.stack,
      });
    }
  }

  function handleModalClose(cancel?: boolean) {
    setModalOpen(false);
    if (cancel) {
      trackEvent(ANALYTICS_KEYS.attachment_Cancelled, { selectedRecords: selectedRecords.length, sobjectName });
      cancelZipDownload(downloadAttachmentUrl);
    } else {
      trackEvent(ANALYTICS_KEYS.attachment_Downloaded, { selectedRecords: selectedRecords.length, sobjectName });
    }
  }

  return (
    <div>
      <div>
        {visible && (
          <div>
            <Tooltip content={disabled ? disabledReason : undefined}>
              <button className="slds-button slds-m-top_xx-small" disabled={!enabled || disabled} onClick={handleInitiateDownload}>
                <Icon type="doctype" icon="attachment" className="slds-button__icon slds-button__icon_left" omitContainer />
                Download Selected Attachments
              </button>
            </Tooltip>
          </div>
        )}
      </div>
      {modalOpen && (
        <Modal
          closeOnBackdropClick={false}
          closeOnEsc={false}
          onClose={() => handleModalClose(true)}
          header="Download Attachments"
          footer={
            <Fragment>
              <button className="slds-button slds-button_neutral" onClick={() => handleModalClose(true)}>
                Cancel
              </button>
              <a href={downloadAttachmentUrl} className="slds-button slds-button_brand" onClick={() => handleModalClose()}>
                Download
              </a>
            </Fragment>
          }
        >
          {errorMessage && (
            <ScopedNotification theme="error" className="slds-m-top_medium">
              <p>{errorMessage}</p>
            </ScopedNotification>
          )}

          <p>You have selected {formatNumber(selectedRecords.length)} records to download content from.</p>
          <p>All of the files will be combined into one zip file.</p>
        </Modal>
      )}
    </div>
  );
};

export default QueryResultsAttachmentDownload;
