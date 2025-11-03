import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '../lib/api';
import { Post } from '../types';

// Get all posts
export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await postsAPI.getAll();
      return response.data;
    }
  });
};

// Get single post
export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const response = await postsAPI.getById(id);
      return response.data;
    },
    enabled: !!id
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Post>) => postsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

// Update post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) => 
      postsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => postsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

// Vote post
export const useVotePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isUpvote }: { id: number; isUpvote: boolean }) => 
      postsAPI.vote(id, isUpvote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

// Add comment
export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) => 
      postsAPI.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};
