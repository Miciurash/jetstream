import * as React from 'react';

function SvgDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <path
        fill="unset"
        d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 8c12.1 0 22 9.9 22 22 0 1-.1 2-.2 3h-8.9c-1 0-1.8.7-2 1.7-.8 5.2-5.4 9.3-10.9 9.3s-10.1-4.1-10.9-9.3c-.1-1-1-1.7-2-1.7h-8.9c-.1-1-.2-2-.2-3 0-12.1 9.9-22 22-22z"
      />
      <path fill="unset" d="M47.7 57.4c2.4 1.3 5.5.3 6.8-2.1 1.9-3.5 5.5-18.9 4.6-19.3-.9-.5-11.6 11.1-13.4 14.7-1.4 2.4-.5 5.4 2 6.7z" />
    </svg>
  );
}

export default SvgDashboard;
