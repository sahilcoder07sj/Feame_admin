import { createFileRoute, useLocation } from '@tanstack/react-router';
import { otpAuthentication as otpAuthenticationSchema } from '../../lib/schema';
import BackButton from '../../components/common/BackButton';
import Logo from '../../components/common/Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../../components/ui/form';
import { Button } from '../../components/ui/button';
import OtpInput from '../../components/common/OtpInput';
import { Route as ResetPasswordRoute } from './reset_password';
import { useEffect } from 'react';
import useAxios from '@/axios/useAxios';
import { Route as LoginRoute } from '@/routes/_authentication';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { VERIFYOTP } from '@/lib/endpoint';

export const Route = createFileRoute('/_authentication/verification')({
  component: Verification
});

function Verification() {
  const navigate = Route.useNavigate();
  const { state } = useLocation();
  const { publicAxios } = useAxios();

  useEffect(() => {
    if (state?.admin?.email) return;
    toast.error('Email not found, try again !');
    navigate({ to: LoginRoute.to });
  }, []);

  const otpAuthenticationForm = useForm({
    resolver: zodResolver(otpAuthenticationSchema),
    defaultValues: { otp: '' }
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [VERIFYOTP],
    mutationFn: data => publicAxios({ url: VERIFYOTP, data })
  });

  const onSubmit = values => {
    toast.promise(mutateAsync({ ...values, email: state.admin.email }), {
      pending: 'Verifying otp...',
      success: {
        render({ data }) {
          navigate({ to: ResetPasswordRoute.to, state: { admin: state.admin } });
          return data.ResponseMsg;
        }
      },
      error: {
        render({ data }) {
          return data.ResponseMsg;
        }
      }
    });
  };

  return (
    <div className='w-full h-full px-4 flex justify-center items-center relative'>
      <BackButton />
      <div className='w-full max-w-[470px] mx-auto'>
        <Logo />
        <div className='mt-8 md:mt-12 sm:space-y-1 lg:space-y-2'>
          <h4 className='text-xl sm:text-2xl lg:text-3xl font-bold text-center dark:text-white'>Authentication</h4>
          <p className='text-gray text-sm sm:text-base lg:text-lg text-center dark:text-input_text'>
            Enter the verification code, we just sent to your email address
          </p>
        </div>
        <Form {...otpAuthenticationForm}>
          <form noValidate onSubmit={otpAuthenticationForm.handleSubmit(onSubmit)} className='mt-6 sm:mt-8'>
            <div className='flex flex-col items-center gap-y-4 md:gap-y-6'>
              <OtpInput name='otp' />
            </div>
            <Button
              type='submit'
              className='w-full py-3 mt-6 sm:mt-8 font-semibold rounded-lg sm:rounded-xl text-base sm:text-xl'
              disabled={!otpAuthenticationForm.formState.isValid || isPending}>
              Verify
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
