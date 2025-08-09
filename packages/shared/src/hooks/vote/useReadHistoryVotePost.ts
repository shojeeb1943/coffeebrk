import { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { RequestKey, generateQueryKey } from '../../lib/query';
import type { ReadHistoryInfiniteData } from '../useInfiniteReadingHistory';
import type { UseVotePost } from './types';
import { useVotePost } from './useVotePost';
import { mutateVoteReadHistoryPost } from './utils';

export type UseReadHistoryVotePost = UseVotePost;

export const useReadHistoryVotePost = (): UseReadHistoryVotePost => {
  const queryClient = useQueryClient();
  const authContext = useContext(AuthContext);
  const { user  } = authContext || {};

  const votePost = useVotePost({
    variables: { key: RequestKey.ReadingHistory },
    onMutate: ({ id, vote }) => {
      const data = queryClient.getQueryData<ReadHistoryInfiniteData>(
        generateQueryKey(RequestKey.ReadingHistory, user),
      );

      return mutateVoteReadHistoryPost({
        id,
        vote,
        data,
        user,
        queryClient,
      });
    },
  });

  return votePost;
};
