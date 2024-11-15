import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import PageNotFoundRoute from './components/common-pages/404';
import Error from './components/common-pages/Error';
import Pagination from './context/Pagination';
import { routeTree } from './routeTree.gen';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        retryDelay: 5000,
        gcTime: 1000 * 60 * 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        placeholderData: {}
      }
    }
  });

  const admin = Cookies.get('name');

  const router = createRouter({
    routeTree,
    context: { queryClient, auth: null },
    defaultPreload: 'intent',
    basepath: import.meta.env.VITE_BASE_PATH,
    defaultNotFoundComponent: PageNotFoundRoute,
    defaultErrorComponent: Error
  });

  return (
    <Pagination>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ auth: admin }} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Pagination>
  );
};

export default App;
