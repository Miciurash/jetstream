import * as React from 'react';

function SvgTxt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 56 64" aria-hidden="true" {...props}>
      <path
        d="M5.151-.036A5.074 5.074 0 00.077 5.038v53.841a5.073 5.073 0 005.074 5.074h45.774a5.074 5.074 0 005.074-5.074V20.274L37.097-.036H5.151z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#F9CA06"
      />
      <g fillRule="evenodd" clipRule="evenodd">
        <path d="M56.008 20.316v1H43.209s-6.312-1.26-6.129-6.708c0 0 .208 5.708 6.004 5.708h12.924z" fill="#F7BC04" />
        <path d="M37.106-.036v14.561c0 1.656 1.104 5.792 6.104 5.792h12.799L37.106-.036z" opacity={0.5} fill="#fff" />
      </g>
      <path
        d="M18.763 43.045h-3.277v10.047a.734.734 0 01-.756.738.73.73 0 01-.738-.738V43.045h-3.259c-.36 0-.648-.288-.648-.684 0-.36.288-.648.648-.648h8.03c.36 0 .648.288.648.685a.645.645 0 01-.648.647zm11.7 10.803a.64.64 0 01-.541-.27l-3.727-4.97-3.745 4.97a.639.639 0 01-.54.27.71.71 0 01-.72-.72c0-.144.036-.306.144-.432l3.889-5.131-3.619-4.826a.721.721 0 01-.144-.414c0-.343.288-.721.72-.721.216 0 .432.108.576.288l3.439 4.627 3.439-4.646a.642.642 0 01.541-.27c.378 0 .738.306.738.721a.7.7 0 01-.126.414l-3.619 4.808 3.89 5.149c.09.126.126.27.126.415a.739.739 0 01-.721.738zm11.195-10.803h-3.277v10.047a.734.734 0 01-.756.738.73.73 0 01-.738-.738V43.045h-3.259c-.36 0-.648-.288-.648-.684 0-.36.288-.648.648-.648h8.03c.36 0 .648.288.648.685a.644.644 0 01-.648.647z"
        fill="#fff"
      />
    </svg>
  );
}

export default SvgTxt;
