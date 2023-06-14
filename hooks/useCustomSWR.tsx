import { SWR } from '@app/types'
import { fetcher as defaultFetcher, fetcher30sectimeout } from '@app/util/web3'
import useSWR from 'swr'
import useStorage from '@app/hooks/useStorage';
import { useEffect } from 'react';

export const useCustomSWR = (key: string, fetcher = defaultFetcher): SWR & { data: any, error: any } => {
  const { value, setter } = useStorage(key);
  const { data, error } = useSWR(key, fetcher);

  useEffect(() => {
    if(typeof data !== 'undefined') {
      setter(data);
    }
  }, [data]);

  return {
    data: data || value,
    isLoading: !error && !data,
    isError: error,
    error,
  }
}

export const useCacheFirstSWR = (key: string, fetcher = defaultFetcher): SWR & { data: any, error: any } => {
  const { value: localCacheData, setter } = useStorage(key);
  const keyCacheFirst = key.indexOf('?') === -1 ? `${key}?cacheFirst=true` : `${key}&cacheFirst=true`
  const { data: apiCacheData } = useSWR(keyCacheFirst, fetcher);
  const { data, error } = useSWR(key, fetcher30sectimeout);

  useEffect(() => {
    if(typeof data !== 'undefined' && (data?.timestamp||0) >= (localCacheData?.timestamp||0)) {
      setter(data);
    }
  }, [data]);

  let mostRecentData;
  if(data?.timestamp || apiCacheData?.timestamp || localCacheData?.timestamp){
    const datas = [data, apiCacheData, localCacheData].sort((a, b,) => (b?.timestamp||0) - (a?.timestamp||0));
    mostRecentData = datas[0];
  } else {
    mostRecentData = data || apiCacheData || localCacheData;
  }

  return {
    data: mostRecentData,
    isLoading: !error && !mostRecentData,
    isError: error,
    error,
  }
}