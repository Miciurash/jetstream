import * as React from 'react';

function SvgVideo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true" {...props}>
      <path
        fill="unset"
        d="M46.9 13.1l-11 7.9v-5.6c0-1.5-1.2-2.7-2.7-2.7H4.7c-1.5 0-2.7 1.2-2.7 2.7v21.3c0 1.5 1.2 2.7 2.7 2.7h28.6c1.5 0 2.7-1.2 2.7-2.7v-5.5L46.9 39c.7.7 1.9.2 1.9-.8V13.9c0-1-1.2-1.5-1.9-.8z"
      />
    </svg>
  );
}

export default SvgVideo;
