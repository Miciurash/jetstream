import classNames from 'classnames';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';
import HelpText from '../../widgets/HelpText';

export interface TextareaProps {
  id: string;
  className?: string;
  labelClassName?: string;
  label?: string | ReactNode;
  labelHelp?: string;
  helpText?: React.ReactNode | string;
  hasError?: boolean;
  readOnly?: boolean;
  isRequired?: boolean;
  errorMessageId?: string;
  errorMessage?: React.ReactNode | string;
  children?: React.ReactNode;
}

export const Textarea: FunctionComponent<TextareaProps> = ({
  id,
  className,
  labelClassName,
  label,
  labelHelp,
  helpText,
  hasError,
  readOnly,
  isRequired,
  errorMessageId,
  errorMessage,
  children,
}) => {
  return (
    <div className={classNames('slds-form-element', className, { 'slds-has-error': hasError })}>
      {label && (
        <Fragment>
          <label className={classNames('slds-form-element__label', labelClassName)} htmlFor={id}>
            {isRequired && (
              <abbr className="slds-required" title="required">
                *{' '}
              </abbr>
            )}
            {label}
          </label>
          {labelHelp && <HelpText id={`${id}-label-help-text`} content={labelHelp} />}
        </Fragment>
      )}
      <div className={classNames('slds-form-element__control', { 'slds-border_bottom': readOnly })}>{children}</div>
      {helpText && <div className="slds-form-element__help">{helpText}</div>}
      {hasError && errorMessage && (
        <div className="slds-form-element__help" id={errorMessageId}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Textarea;
