import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

interface PostPageProps {

}

const PostPage: React.FC<PostPageProps> = ({}) => {
  const router = useRouter();
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
 
  const [{data, fetching}] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId
    }
  });

    return (<div>
      Hello post {intId}
    </div>);
}

export default withUrqlClient(createUrqlClient, {ssr: true})(PostPage);