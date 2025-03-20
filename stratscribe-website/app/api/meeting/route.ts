import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');
  const discordId = request.nextUrl.searchParams.get('discord_id');
  
  if (!uid && !discordId) {
    return NextResponse.json({ error: 'Either uid or discord_id parameter is required' }, { status: 400 });
  }

    // First check if the user exists in the database
    console.log("uid: ", uid);
    console.log("discordId: ", discordId);
    
    const { data: userData, error: userError } = await supabase
      .from('meetings')
      .select('*')
      .or('userID.eq.' + uid + ',discordID.eq.' + discordId);
    
    if (userError) {
      // console.log(uid);
      console.log('User has no meetings');
      console.log(userError);
    return;}
    
    console.log('User found, returning user data');
    return NextResponse.json(userData);
 
} 