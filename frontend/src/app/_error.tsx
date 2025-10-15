'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CustomError({ statusCode }: { statusCode?: number }) {
  const [GridShape, setGridShape] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('@/components/common/GridShape')
      .then((mod) => setGridShape(() => mod.default))
      .catch(console.error);
  }, []);

  const is404 = statusCode === 404;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      {/* Render GridShape hanya jika sudah di-load di client */}
      {GridShape && <GridShape />}

      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1>{is404 ? '404 - Not Found' : 'ERROR'}</h1>

        <Image
          src={is404 ? '/images/error/404.svg' : '/images/error/server-error.svg'}
          alt="Error"
          width={472}
          height={152}
          className="dark:hidden"
        />
        <Image
          src={is404 ? '/images/error/404-dark.svg' : '/images/error/server-error-dark.svg'}
          alt="Error"
          width={472}
          height={152}
          className="hidden dark:block"
        />

        <p>
          {is404
            ? "We can't seem to find the page you are looking for!"
            : 'Oops! Something went wrong on our end.'}
        </p>

        <Link href="/">Back to Home Page</Link>
      </div>

      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-center text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - TailAdmin
      </footer>
    </div>
  );
}

CustomError.getInitialProps = ({ res, err }: any) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};
