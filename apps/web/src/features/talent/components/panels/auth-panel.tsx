import { useState } from 'react';
import { authClient } from '@lib/auth-client';
import { CrudSurface, TextInput } from '@components/form-controls';

export function AuthPanel() {
  const session = authClient.useSession();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    setMessage('');
    const response =
      mode === 'sign-in'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });
    if (response.error) {
      setMessage(response.error.message ?? 'Auth failed');
      return;
    }
    setMessage(mode === 'sign-in' ? 'Signed in' : 'Account created');
    await session.refetch();
  };

  return (
    <CrudSurface
      title="Auth"
      form={
        <form onSubmit={submit}>
          <div className="auth-mode">
            <button
              type="button"
              className={`btn btn-sm rounded-none ${mode === 'sign-in' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMode('sign-in')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-none ${mode === 'sign-up' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMode('sign-up')}
            >
              Sign up
            </button>
          </div>
          {mode === 'sign-up' && <TextInput label="Name" value={name} onChange={setName} />}
          <TextInput label="Email" type="email" value={email} onChange={setEmail} />
          <TextInput label="Password" type="password" value={password} onChange={setPassword} />
          <div className="mt-5 flex gap-3">
            <button className="btn btn-primary rounded-none" type="submit">
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
            {session.data && (
              <button
                className="btn btn-outline rounded-none"
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  await session.refetch();
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </form>
      }
      table={
        <div className="auth-status">
          <p>Session</p>
          <h2>{session.data?.user?.email ?? 'Guest'}</h2>
          {message && <div className="editorial-notice">{message}</div>}
        </div>
      }
    />
  );
}
