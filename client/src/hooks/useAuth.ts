import { NextRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';

export const useAuth = (router: NextRouter) => {
	const [{ data, fetching }] = useMeQuery();
	useEffect(() => {
		if (fetching) return;
		if (!data?.me) {
			router.replace('/login?next=' + router.pathname);
		}
	}, [fetching, data, router]);
};
