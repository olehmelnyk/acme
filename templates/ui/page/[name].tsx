import { Metadata } from 'next'
import { Layout } from '@/components/layout'

export const metadata: Metadata = {
  title: '[name]',
  description: '[description]',
}

interface [name]PageProps {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function [name]Page({
  params,
  searchParams,
}: [name]PageProps) {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold">[name]</h1>
        {/* Add page content here */}
      </div>
    </Layout>
  )
}

export const dynamic = 'force-dynamic'
