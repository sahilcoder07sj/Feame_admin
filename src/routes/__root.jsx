import { Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Route = createRootRouteWithContext()({
  component: Root
});

function Root() {
  const { location } = useRouterState();

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  return (
    <>
      <ToastContainer
        theme='dark'
        position='top-right'
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
      />
      <Outlet />
    </>
  );
}

export default Root;
