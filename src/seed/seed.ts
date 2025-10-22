import bcryptjs from "bcryptjs";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  username: string;
  avatar: string;
  isFollowing?: boolean;
  interests: string[];
  role: 'admin' | 'user' | 'publisher';
}

interface SeedData {
  users: SeedUser[];
  categories: string[];
}

export const initialData: SeedData = {
  users: [
    {
      name: 'Juan Constantine',
      email: 'juan@gmail.com',
      password: bcryptjs.hashSync('123456'),
      username: 'juanConstantine',
      avatar: '',
      isFollowing: false,
      interests: ['restaurant'],
      role: 'admin',
    },
    {
      name: 'Jose Murillo',
      email: 'jose@gmail.com',
      password: bcryptjs.hashSync('123456'),
      username: 'joseMurillo',
      avatar: '',
      isFollowing: false,
      interests: ['music'],
      role: 'user',
    },
    {
      name: 'Sol Idrovo',
      email: 'sol@gmail.com',
      password: bcryptjs.hashSync('123456'),
      username: 'solIdrovo',
      avatar: '',
      isFollowing: false,
      interests: ['music'],
      role: 'publisher',
    }
  ],
  categories: [
    "Restaurant",
    "Music",
    "Bar",
    "Discotheque",
    "Sports",
    "Art",
    "Theater",
    "Technology",
    "Fashion",
    "Networking",
    "Festival",
    "Food",
    "Cinema",
    "Education",
    "Wellness"
  ],
}