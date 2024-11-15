import { Route as LoginRoute } from '@/routes/_authentication';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useContext } from 'react';
import { PaginationContext } from '../context/Pagination';
import { ADMIN_COOKIE, API_METHOD, PAGINATION_DISPATCH_TYPES } from '../lib/constant';

const useAxios = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(PaginationContext);

  const instance = axios.create({
    method: API_METHOD.post,
    baseURL: import.meta.env.VITE_BASE_URL + import.meta.env.VITE_BASE_API_NAME,
    headers: { key: import.meta.env.VITE_API_KEY }
  });

  const publicAxios = async req => {
    const { data } = await instance(req);
    if (data.ResponseCode !== 1) throw data;
    return data;
  };

  const privateAxios = async req => {
    const admin = Cookies.get(ADMIN_COOKIE);

    try {
      const { token, admin_id } = JSON.parse(admin);

      instance.interceptors.request.use(req => {
        req.headers.token = token;
        return req;
      });

      req.data = Object.assign(req.data ?? {}, { admin_id });

      instance.interceptors.response.use(res => {
        if (res.data.ResponseCode === 6) {
          Cookies.remove(ADMIN_COOKIE);
          return navigate({ to: LoginRoute.to });
        }
        return res;
      });

      const { data } = await instance(req);

      if (data.ResponseCode !== 1) throw data;
      if (typeof data.data?.totalRecord === 'number') {
        dispatch({ type: PAGINATION_DISPATCH_TYPES.set_totalRecord, payload: data.data.totalRecord });
      }
      return data;
    } catch (error) {
      return error;
    }
  };

  return { publicAxios, privateAxios };
};

export default useAxios;
