import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

function MetaData({ title }) {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </HelmetProvider>
  );
}

export default MetaData;