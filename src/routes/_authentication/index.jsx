import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { login as loginSchema } from '../../lib/schema';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Form } from '../../components/ui/form';
import InputWithLabel from '../../components/common/InputWithLabel';
import { zodResolver } from '@hookform/resolvers/zod';
import Logo from '../../components/common/Logo';
import { Route as ForgotPasswordRoute } from './forgot_password';
import { Route as UserRoute } from '../_layout/users';
import useAxios from '@/axios/useAxios';
import { LOGIN } from '@/lib/endpoint';
import { toast } from 'react-toastify';
import { ADMIN_COOKIE } from '@/lib/constant';
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';
import md5 from 'md5';
import { getObjLength } from '@/lib/utils';

export const Route = createFileRoute('/_authentication/')({
  component: Login,
  beforeLoad: () => {
    const admin = Cookies.get(ADMIN_COOKIE);
    try {
      const { token = null } = JSON.parse(admin);
      if (token) {
        throw redirect({ to: UserRoute.to });
      }
    } catch (error) {
      if (error.to) {
        throw redirect({ to: UserRoute.to });
      }
    }
  }
});

function Login() {
  const { publicAxios } = useAxios();
  const navigate = Route.useNavigate();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const callbackurl = Route.useSearch({ select: search => search.cb });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [LOGIN],
    mutationFn: data => publicAxios({ url: LOGIN, data })
  });

  const onSubmit = async values => {
    toast.promise(mutateAsync({ ...values, password: md5(values.password) }), {
      pending: 'Loging in...',
      success: {
        render({ data }) {
          Cookies.set(ADMIN_COOKIE, JSON.stringify(data.data));
          if (callbackurl) {
            navigate({ to: callbackurl });
          } else {
            navigate({ to: UserRoute.to, search: { page: 1, limit: 10 } });
          }
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
    <div className='w-full h-full px-4 flex justify-center items-center'>
      <div className='w-full max-w-[470px] mx-auto'>
        <Logo />
        <div className='mt-8 md:mt-12 sm:space-y-1 lg:space-y-2'>
          <h4 className='text-xl sm:text-2xl lg:text-3xl font-bold text-center dark:text-white'>Welcome Back!</h4>
          <p className='text-gray text-sm sm:text-base lg:text-lg text-center dark:text-input_text'>Please sign in to continue</p>
        </div>
        <Form {...loginForm}>
          <form noValidate onSubmit={loginForm.handleSubmit(onSubmit)} className='mt-6 sm:mt-8 lg:mt-10'>
            <div className='space-y-5'>
              <InputWithLabel label='Email' name='email' placeholder='Enter email' />
              <InputWithLabel
                label='Password'
                name='password'
                type={isShowPassword ? 'text' : 'password'}
                placeholder='Password'
                suffix={
                  <button type='button' className='h-full px-3' onClick={() => setIsShowPassword(!isShowPassword)}>
                    {isShowPassword ? (
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                          d='M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42004 13.98 8.42004 12C8.42004 10.02 10.02 8.41998 12 8.41998C13.98 8.41998 15.58 10.02 15.58 12Z'
                          stroke='#F5F5F5'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.46997 3.71997 5.17997 5.79997 2.88997 9.39997C1.98997 10.81 1.98997 13.18 2.88997 14.59C5.17997 18.19 8.46997 20.27 12 20.27Z'
                          stroke='#F5F5F5'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    ) : (
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                          d='M14.53 9.46998L9.47004 14.53C8.82004 13.88 8.42004 12.99 8.42004 12C8.42004 10.02 10.02 8.41998 12 8.41998C12.99 8.41998 13.88 8.81998 14.53 9.46998Z'
                          stroke='#F5F5F5'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M17.82 5.76998C16.07 4.44998 14.07 3.72998 12 3.72998C8.46997 3.72998 5.17997 5.80998 2.88997 9.40998C1.98997 10.82 1.98997 13.19 2.88997 14.6C3.67997 15.84 4.59997 16.91 5.59997 17.77'
                          stroke='#F5F5F5'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M8.42004 19.53C9.56004 20.01 10.77 20.27 12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39999C20.78 8.87999 20.42 8.38999 20.05 7.92999'
                          stroke='#F5F5F5'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M15.5099 12.7C15.2499 14.11 14.0999 15.26 12.6899 15.52'
                          stroke='#F5F5F5'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path d='M9.47 14.53L2 22' stroke='#F5F5F5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                        <path d='M22 2L14.53 9.47' stroke='#F5F5F5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    )}
                  </button>
                }
              />
            </div>
            <div className='mt-2 mb-6 sm:mb-8 text-end'>
              <Link to={ForgotPasswordRoute.to} className='text-base sm:text-lg font-medium dark:text-bg_main'>
                Forgot Password?
              </Link>
            </div>
            <Button
              type='submit'
              className='w-full py-3 font-semibold rounded-lg sm:rounded-xl text-base sm:text-xl'
              disabled={getObjLength(loginForm.formState.dirtyFields) !== 2 || isPending}>
              Sign In
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
