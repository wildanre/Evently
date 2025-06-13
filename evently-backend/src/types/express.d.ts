import { User } from './index';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      profileImageUrl?: string | null;
      bio?: string | null;
    }
  }
}
