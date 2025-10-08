import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Test Storage API: Starting...');

    const supabase = await createServiceRoleClient();

    // Test 1: List buckets
    console.log('🧪 Test Storage API: Listing buckets...');
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('🧪 Test Storage API: Buckets error:', bucketsError);
      return NextResponse.json(
        {
          error: 'Failed to list buckets',
          details: bucketsError.message,
        },
        { status: 500 }
      );
    }

    console.log('🧪 Test Storage API: Buckets found:', buckets);

    // Test 2: List files in photos bucket
    console.log('🧪 Test Storage API: Listing files in photos bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('photos')
      .list();

    if (filesError) {
      console.error('🧪 Test Storage API: Files error:', filesError);
      return NextResponse.json(
        {
          error: 'Failed to list files',
          details: filesError.message,
        },
        { status: 500 }
      );
    }

    console.log('🧪 Test Storage API: Files found:', files);

    // Test 3: Check if we can create a simple file
    console.log('🧪 Test Storage API: Testing file creation...');
    const testContent = new Blob(['test content'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false,
      });

    if (uploadError) {
      console.error('🧪 Test Storage API: Upload test failed:', uploadError);
      return NextResponse.json(
        {
          error: 'Upload test failed',
          details: uploadError.message,
          buckets: buckets,
          files: files,
        },
        { status: 500 }
      );
    }

    console.log('🧪 Test Storage API: Upload test successful:', uploadData);

    // Clean up test file
    await supabase.storage.from('photos').remove([testFileName]);

    return NextResponse.json({
      success: true,
      buckets: buckets,
      files: files,
      uploadTest: uploadData,
    });
  } catch (error) {
    console.error('🧪 Test Storage API: Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
