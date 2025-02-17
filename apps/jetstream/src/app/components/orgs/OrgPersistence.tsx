import React, { Fragment, FunctionComponent, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { selectedOrgIdState, STORAGE_KEYS } from '../../app-state';

export const OrgPersistence: FunctionComponent = () => {
  const [selectedOrgId] = useRecoilState<string>(selectedOrgIdState);

  useEffect(() => {
    if (selectedOrgId) {
      const orgId = btoa(selectedOrgId);
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_ORG_STORAGE_KEY, orgId);
      localStorage.setItem(STORAGE_KEYS.SELECTED_ORG_STORAGE_KEY, orgId);
    }
  }, [selectedOrgId]);

  return <Fragment />;
};

export default OrgPersistence;
