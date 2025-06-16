import React from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form className="flex flex-col gap-4">
        <Input type="text" placeholder="Username" required />
        <Input type="email" placeholder="Email" required />
        <Input type="password" placeholder="Password" required />
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
}
