export function formatError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    if (message.includes('Unauthorized')) {
      return 'You do not have permission to perform this action. Please sign in.';
    }
    
    if (message.includes('does not exist')) {
      return 'The requested item was not found.';
    }
    
    if (message.includes('trap')) {
      return 'An error occurred on the server. Please try again.';
    }
    
    return message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
