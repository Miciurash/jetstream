import * as React from 'react';

function SvgViewRelationship(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true" {...props}>
      <path fill="unset" d="M36 20c0-2.2-1.8-4-4-4H6c-2.2 0-4 1.8-4 4v26c0 2.2 1.8 4 4 4h26c2.2 0 4-1.8 4-4V20z" />
      <path
        fill="unset"
        d="M43 42h-3v-6h3c.6 0 1-.4 1-1V9c0-.6-.4-1-1-1H17c-.6 0-1 .4-1 1v3h-6V9c0-3.9 3.1-7 7-7h26c3.9 0 7 3.1 7 7v26c0 3.9-3.1 7-7 7z"
      />
    </svg>
  );
}

export default SvgViewRelationship;
