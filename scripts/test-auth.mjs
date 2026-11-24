import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testAuth() {
  console.log('=== Testing Supabase Auth Service ===');
  // Use standard email domain
  const testEmail = `greenverse.tester.${Math.floor(Date.now() / 1000)}@gmail.com`;
  const testPassword = 'GreenverseForestry2026!';

  console.log('1. Testing registration with supabase.auth.signUp()...');
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Forester',
        },
      },
    });

    if (signUpError) {
      console.log('   - SignUp Result: FAILED with message:', signUpError.message);
      console.log('   - Error code:', signUpError.code || signUpError.status);
    } else {
      console.log('   - SignUp Result: SUCCESS');
      console.log('   - User ID created:', Boolean(signUpData.user?.id));
      console.log('   - Immediate session returned?:', Boolean(signUpData.session));
      if (!signUpData.session) {
        console.log('   - Supabase Auth Setting: "Confirm email" is currently ENABLED.');
        console.log('     (Supabase sends an email confirmation link before allowing sign-in).');
      } else {
        console.log('   - Supabase Auth Setting: "Confirm email" is DISABLED.');
        console.log('     (Users can sign in immediately upon registration).');
      }
    }

    console.log('\n2. Testing login with supabase.auth.signInWithPassword()...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('   - SignIn Result: Expected response:', signInError.message);
    } else {
      console.log('   - SignIn Result: SUCCESS! User session token active.');
    }

    console.log('\n3. Testing invalid credentials handling...');
    const { error: invalidError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'WrongPassword123!',
    });
    console.log('   - Invalid credentials rejection check:', invalidError ? 'PASSED (Properly rejected with: ' + invalidError.message + ')' : 'FAILED');

  } catch (err) {
    console.error('Exception during auth testing:', err.message);
  }
}

testAuth();
