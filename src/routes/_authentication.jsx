import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AUTHENTICATION } from '../lib/images'

export const Route = createFileRoute('/_authentication')({
  component: AuthenticationLayout
})

function AuthenticationLayout() {
  return (
    <section className='w-full h-full p-6 lg:p-8 xl:p-10 flex flex-col md:flex-row items-stretch overflow-hidden dark:bg-black'>
      <div className='w-full max-w-[470px] md:max-w-full mx-auto md:mx-0 rounded-[30px] lg:rounded-[40px] xl:rounded-[50px]'>
        <div className='h-full flex justify-center items-center'>
          <img className='w-full h-full rounded-[25px] object-top object-cover' src={AUTHENTICATION} alt="auth" />
        </div>
      </div>
      <Outlet />
    </section>
  )
}

