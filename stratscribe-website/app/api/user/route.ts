import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');
  
  if (!uid) {
    return NextResponse.json({ error: 'uid parameter is required' }, { status: 400 });
  }

  try {
    // First check if the user exists in the database
    const { data: userData, error: userError } = await supabase
      .from('userData')
      .select('*')
      .eq('userID', uid)
      .single();
    
    if (userError) {
      // console.log(uid);
      console.log('User not found, creating new user');
      
      try {
        // If user doesn't exist, create a new user record with default values
        const { data: newUser, error: createError } = await supabase
          .from('userData')
          .insert([
            { 
              userID: uid, 
              totalRecordings: 0, 
              monthlyHours: 0, 
              plan: 'Free' 
            }
          ]);
        
        if (createError) {
          console.error('Error creating user:', createError);
          // Instead of failing, return default values
          return NextResponse.json({ 
            userID: uid, 
            totalRecordings: 0, 
            monthlyHours: 0, 
            plan: 'Free',
            isDefaultData: true
          });
        }
        
        // Return the newly created user or default values
        return NextResponse.json(newUser?.[0] || { 
          userID: uid, 
          totalRecordings: 0, 
          monthlyHours: 0, 
          plan: 'Free',
          isDefaultData: true
        });
      } catch (insertError) {
        console.error('Error in insert operation:', insertError);
        // Return default values if insert fails
        return NextResponse.json({ 
          userID: uid, 
          totalRecordings: 0, 
          monthlyHours: 0, 
          plan: 'Free',
          isDefaultData: true
        });
      }
    }
    
    console.log('User found, returning user data');
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error processing request:', error);
    // Return default values instead of an error
    return NextResponse.json({ 
      userID: uid, 
      totalRecordings: 0, 
      monthlyHours: 0, 
      plan: 'Free',
      isDefaultData: true
    });
  }
} 