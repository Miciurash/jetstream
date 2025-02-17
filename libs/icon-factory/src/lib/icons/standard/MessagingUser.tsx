import * as React from 'react';

function SvgMessagingUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <path
        fill="unset"
        d="M50 22c16.6 0 30 12.5 30.1 28 0 15.5-13.4 28-30 28-5.8 0-11.2-1.5-15.8-4.2-.5-.3-1.1-.4-1.7-.2l-8.8 3.1c-1.6.5-3.1-.9-2.6-2.5l2.8-8.9c.2-.5.1-1.1-.2-1.6C21.4 59.6 20 55 20 50c0-15.5 13.4-28 30-28zm8.757 42c1.915 0 3.426-2.108 3.225-4.115-.1-3.01-3.225-5.018-6.55-6.423-2.317-.903-2.62-1.806-2.62-2.81 0-1.003.605-1.906 1.411-2.609 1.41-1.204 2.116-3.01 2.116-5.018 0-3.814-2.317-7.025-6.348-7.025-4.03 0-6.348 3.211-6.348 7.025 0 2.007.806 3.814 2.116 5.018.806.703 1.41 1.606 1.41 2.61 0 1.003-.302 1.906-2.62 2.91-3.325 1.505-6.448 3.312-6.549 6.322C38 61.892 39.511 64 41.426 64h17.331z"
      />
    </svg>
  );
}

export default SvgMessagingUser;
