'use client';

import { loginAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sign in
    </Button>
  );
}

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [state, formAction] = useActionState(loginAction, {
    message: '',
    type: '',
  });

  useEffect(() => {
    if (state.type === 'error') {
      toast({
        title: 'Login Failed',
        description: state.message,
        variant: 'destructive',
      });
    } else if (state.type === 'success') {
      toast({
        title: 'Login Successful',
        description: state.message,
      });
      // Re-check auth state to update UI
      checkAuth().then(() => {
        router.push('/feed');
      });
    }
  }, [state, toast, router, checkAuth]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
