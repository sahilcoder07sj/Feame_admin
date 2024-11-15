import { useLocation, useParams, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';

import { Route as UsersRoute } from '../routes/_layout/users';
import { Route as EventsRoute } from '../routes/_layout/events';
import { Route as VideosRoute } from '../routes/_layout/videos';
import { Route as ScoreboardRoute } from '../routes/_layout/scoreboard';

const usePaths = () => {
  const { pathname, searchStr, search } = useLocation();
  const params = useParams({ strict: false });

  const path = useMemo(
    () => [
      {
        path: 'users',
        name: 'User Management',
        previousPaths: []
      },
      {
        path: 'users/accepted',
        name: 'Accepted Users',
        previousPaths: [
          {
            path: UsersRoute.to,
            name: 'User Management'
          }
        ]
      },
      {
        path: 'events',
        name: 'Events',
        previousPaths: []
      },
      {
        path: `events/${params.event_id}`,
        name: search?.name ?? 'No name found',
        previousPaths: [
          {
            path: EventsRoute.to,
            name: 'Events'
          }
        ]
      },
      {
        path: 'videos',
        name: 'Videos',
        previousPaths: []
      },
      {
        path: 'scoreboard',
        name: 'Scoreboard',
        previousPaths: []
      }
    ],
    [params.hasOwnProperty('event_id')]
  );

  return path.find(path => import.meta.env.VITE_BASE_PATH + path.path === pathname.replace(searchStr, '')) ?? {};
};

export default usePaths;
