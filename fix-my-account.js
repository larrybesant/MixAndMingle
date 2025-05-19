import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client with admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMyAccount(email) {
  console.log(`🔍 Checking account for: ${email}`)
  
  // Step 1: Check if user exists
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.error('Error fetching users:', userError.message)
    return
  }
  
  const user = userData.users.find(u => u.email === email)
  
  if (!user) {
    console.log('Account not found. Creating new account...')
    
    // Generate a secure password
    const password = Math.random().toString(36).slice(-10) + 
                    Math.random().toString(36).toUpperCase().slice(-2) + 
                    '!';
    
    // Create the user with confirmed email
    const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_beta_tester: true }
    })
    
    if (createError) {
      console.error('Error creating account:', createError.message)
      return
    }
    
    console.log(`✅ Created account with email: ${email}`)
    console.log(`✅ Your temporary password: ${password}`)
    
    // Create a profile
    if (newUserData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: newUserData.user.id,
          full_name: "Larry Besant",
          email: email,
          is_beta_tester: true,
          beta_joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      
      if (profileError) {
        console.error('Error creating profile:', profileError.message)
      } else {
        console.log('✅ Created profile successfully')
      }
    }
    
    return
  }
  
  // User exists, check if email is confirmed
  console.log('✅ Account found:')
  console.log({
    id: user.id,
    email: user.email,
    emailConfirmed: !!user.email_confirmed_at,
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at
  })
  
  // Confirm email if needed
  if (!user.email_confirmed_at) {
    console.log('Confirming your email...')
    
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    )
    
    if (confirmError) {
      console.error('Error confirming email:', confirmError.message)
    } else {
      console.log('✅ Email confirmed successfully')
    }
  }
  
  // Check if user has a profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError && profileError.code === 'PGRST116') {
    console.log('Creating your profile...')
    
    const { error: createProfileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        full_name: "Larry Besant",
        email: email,
        is_beta_tester: true,
        beta_joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    
    if (createProfileError) {
      console.error('Error creating profile:', createProfileError.message)
    } else {
      console.log('✅ Profile created successfully')
    }
  } else if (!profileError) {
    console.log('✅ Profile exists')
  }
  
  // Generate password reset link
  console.log('Generating password reset link...')
  
  const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email
  })
  
  if (resetError) {
    console.error('Error generating password reset link:', resetError.message)
  } else if (resetData && resetData.properties && resetData.properties.action_link) {
    console.log('✅ Use this link to reset your password:')
    console.log(resetData.properties.action_link)
  }
  
  console.log('✅ Your account is ready for beta testing')
}

// Fix your specific account
fixMyAccount('larrybesant@gmail.com')
