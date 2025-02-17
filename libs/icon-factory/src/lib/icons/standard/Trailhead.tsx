import * as React from 'react';

function SvgTrailhead(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <path fill="unset" d="M32.7 63.8l-3.2 3.7h6.4zM35.7 71.4h6.4l-3.2-3.7zM61.3 68.8l3.2-3.7 3.2 3.7z" />
      <path
        fill="unset"
        d="M50.9 20.2c-.5-.3-1.2-.3-1.7 0C31.3 27.8 19.8 45.5 20.1 65v4.3c0 .7.3 1.3.9 1.7 8.6 5.7 18.8 8.9 29.1 9h1.1c9.9-.4 19.6-3.4 27.8-9 .5-.4.9-1 .9-1.7V65c.5-19.5-11-37.2-29-44.8zM34.7 36c7.3-8.6 15.4-11.5 15.4-11.5 1.7.8 21.2 8.4 25.2 33h-5.1l-9.8-14.1c-.7-.9-2-1.2-3-.5-.3.1-.4.4-.5.5L54.4 47l-6.9-9.9c-.7-.9-2-1.2-3-.5-.3.1-.4.4-.5.5L30.1 57.4l-5.1.2c1.5-9.4 5.4-16.4 9.7-21.6zM65 57.6H52.3l3.3-4.7 3-4.4 6.4 9.1zm-18-14l5 7.2-4.7 6.7H35.2l5.1-7.6 5.4-8 1.3 1.7zm4.8 29L50 75.8c-3.7 0-7.1-.5-11-1.4-5.1-1.3-10.1-3.4-14.5-6.1v-3.1c0-1 0-2.1.1-3.3h22.1c-1.7 2.6-.9 6.1 1.8 7.7.3.1.5.3.7.4l2 .9c.6.2.8 1 .6 1.7zm24-4.5c-3.3 2-6.7 3.7-10.2 4.8 0 0-.7.3-.9.3-2 .7-4 1.2-6.1 1.6-1.2.3-2.4.4-3.5.5l.4-.7c1.6-2.7.7-6.1-2.1-7.7-.1-.1-.4-.1-.5-.3l-2-.9c-.7-.3-1-1-.7-1.7 0-.1.1-.3.1-.3l1.8-2.1h23.5c0 1 .1 2.1.1 3.3v3.2z"
      />
    </svg>
  );
}

export default SvgTrailhead;
