import { css } from '@emotion/react';
import { SalesforceOrgUi } from '@jetstream/types';
import { Alert, EmptyState, NoAccess2Illustration } from '@jetstream/ui';
import { Fragment, FunctionComponent, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import * as fromAppState from '../../app-state';
import * as fromJetstreamEvents from '../core/jetstream-events';
import AddOrg from './AddOrg';
import { OrgWelcomeInstructions } from './OrgWelcomeInstructions';

export interface OrgSelectionRequiredProps {
  children?: React.ReactNode;
}

export const OrgSelectionRequired: FunctionComponent<OrgSelectionRequiredProps> = ({ children }) => {
  const selectedOrg = useRecoilValue<SalesforceOrgUi>(fromAppState.selectedOrgState);
  const hasConfiguredOrg = useRecoilValue<boolean>(fromAppState.hasConfiguredOrgState);

  const handleAddOrg = useCallback((org: SalesforceOrgUi, switchActiveOrg: boolean) => {
    fromJetstreamEvents.emit({ type: 'addOrg', payload: { org, switchActiveOrg } });
  }, []);

  return (
    <Fragment>
      {selectedOrg && !selectedOrg.connectionError && children}
      {selectedOrg?.connectionError && (
        <div
          css={css`
            background-color: white;
          `}
        >
          <Alert type="error" leadingIcon="error">
            <div>
              <p>There was a problem connecting your org, re-connect your org to fix it.</p>
              <p>If you recently did a sandbox refresh and have a new Organization Id, you will need to delete the old org.</p>
            </div>
          </Alert>
          <div>
            <EmptyState size="large" headline={`Fix your org connection to continue`} illustration={<NoAccess2Illustration />}>
              <AddOrg className="slds-button_brand" label="Reconnect Org" onAddOrg={handleAddOrg} />
            </EmptyState>
          </div>
        </div>
      )}
      {!selectedOrg && (
        <div>
          {hasConfiguredOrg && (
            <Alert type="info" leadingIcon="info">
              This action requires an org to be selected. Use the org dropdown to configure or select an org.
            </Alert>
          )}
          {!hasConfiguredOrg && <OrgWelcomeInstructions />}
        </div>
      )}
    </Fragment>
  );
};

export default OrgSelectionRequired;
