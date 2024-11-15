import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import BackButton from '../../components/common/BackButton';
import InputWithLabel from '../../components/common/InputWithLabel';
import Logo from '../../components/common/Logo';
import { Button } from '../../components/ui/button';
import { Form } from '../../components/ui/form';
import { forgotPassword as forgotPasswordSchema } from '../../lib/schema';
import { Route as OTPVerificationRoute } from './verification';
import { FORGOTPASSWORD } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { getObjLength } from '@/lib/utils';

export const Route = createFileRoute('/_authentication/forgot_password')({
  component: ForgotPassword
});

function ForgotPassword() {
  const { publicAxios } = useAxios();
  const navigate = Route.useNavigate();

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [FORGOTPASSWORD],
    mutationFn: data => publicAxios({ url: FORGOTPASSWORD, data })
  });

  const onSubmit = values => {
    toast.promise(mutateAsync(values), {
      pending: 'Verifying email...',
      success: {
        render({ data }) {
          navigate({ to: OTPVerificationRoute.to, state: { admin: data.data } });
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
          <h4 className='text-xl sm:text-2xl lg:text-3xl font-bold text-center dark:text-white'>Forgot Password</h4>
          <p className='text-gray text-sm sm:text-base lg:text-lg text-center dark:text-input_text'>No worries, we will help you to reset your password</p>
        </div>
        <Form {...forgotPasswordForm}>
          <form noValidate onSubmit={forgotPasswordForm.handleSubmit(onSubmit)} className='mt-6 sm:mt-8 lg:mt-10'>
            <InputWithLabel label='Email' name='email' placeholder='Enter email' />
            <Button
              type='submit'
              className='w-full py-3 mt-6 sm:mt-8 font-semibold rounded-lg sm:rounded-xl text-base sm:text-xl'
              disabled={getObjLength(forgotPasswordForm.formState.dirtyFields) !== 1 || isPending}>
              Send
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
