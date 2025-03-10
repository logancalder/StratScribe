import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');
  
  if (!uid) {
    return NextResponse.json({ error: 'uid parameter is required' }, { status: 400 });
  }

    // First check if the user exists in the database
    console.log("uid: ", uid);
    
    const { data: userData, error: userError } = await supabase
      .from('meetings')
      .select('*')
      .eq('userID', uid);
    
    if (userError) {
      // console.log(uid);
      console.log('User has no meetings');
      console.log(userError);
    return;}
    
    console.log('User found, returning user data');
    return NextResponse.json(userData);
 
} 