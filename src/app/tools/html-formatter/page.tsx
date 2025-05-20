import React from 'react';
import Layout from '@/components/layout/Layout';
import { HtmlFormatter } from '@/components/tools/html-formatter/HtmlFormatter';

export default function HtmlFormatterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HTML整形</h1>
        <HtmlFormatter />
      </div>
    </Layout>
  );
}
