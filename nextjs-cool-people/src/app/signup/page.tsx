'use client';

import { signupAction } from '@/lib/actions';
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
      Create Account
    </Button>
  );
}

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [state, formAction] = useActionState(signupAction, {
    message: '',
    type: '',
  });

  useEffect(() => {
    if (state?.type === 'error') {
      toast({
        title: 'Signup Failed',
        description: state.message,
        variant: 'destructive',
      });
    } else if (state?.type === 'success') {
      // This part might not be hit if redirect happens, but good for non-redirect cases
      toast({
        title: 'Signup Successful!',
        description: 'Welcome to CoolPeople!',
      });
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
            <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Create an account to join the conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
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
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
