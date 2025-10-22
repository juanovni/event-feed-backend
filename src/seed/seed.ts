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

interface SeeEvent {
  title: string;
  description: string;
  mediaType: ValidMediaType;
  mediaUrl: string;
  likes: number;
  isLiked: boolean;
  cost: number;
  currency: string;
  gallery?: string[];
  location: string;
  eventDate: Date;
  category: string;
  attendees: number;
  interested: number;
  userStatus: 'attending' | 'interested' | 'none';
}
type ValidMediaType = 'image' | 'video';
type ValidEventCategory = "Restaurant" |
  "Music" |
  "Bar" |
  "Discotheque" |
  "Sports" |
  "Art" |
  "Theater" |
  "Technology" |
  "Fashion" |
  "Networking" |
  "Festival" |
  "Food" |
  "Cinema" |
  "Education" |
  "Wellness";

interface SeedData {
  users: SeedUser[];
  categories: string[];
  events: SeeEvent[];
}

export const initialData: SeedData = {
  events: [
    {
      //user: mockUsers[1],
      title: 'Noche de Week y Bebidas',
      description: 'Este año ha sido el año de los recuerdos, para Negroni Week, seguimos la ruta. Los 3 Negronis más queridos de nuestras 3 primeras celebraciones junto una nueva forma de armar tu propio Negroni: AL AZAR 🎲 🎲 ⭕️',
      location: 'Plaza Mayor, Centro Histórico',
      eventDate: new Date('2025-01-08T06:45:00'),
      mediaType: 'image',
      mediaUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/554396372_18063879602584200_8012309436171417339_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ig_cache_key=MzcyODgwOTQ2OTc0OTg3OTg1MA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTM1MC5zZHIuQzMifQ%3D%3D&_nc_ohc=gfaaJ9nWDg0Q7kNvwH0TJEA&_nc_oc=Adl6IV2B7-dS3LqG0EeRMNQzkBScr7CUickiwjZliTRu8kTU5TmBKuyDydJrndA3q70&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=q6u-RHV99Vh4U9yPcb08rg&oh=00_AfcPDjo8MTImrjm7rV_heeMqTDhn56WVDnC6dqsIgopGBQ&oe=68F880AE',
      likes: 234,
      isLiked: false,
      cost: 12.87,
      currency: 'USA',
      category: "Restaurant",
      attendees: 2,
      interested: 10,
      userStatus: "interested",
      gallery: [
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      //user: mockUsers[1],
      title: 'Conferencia Tech Innovation 2025',
      description: 'Las últimas tendencias en tecnología, IA y desarrollo. Speakers internacionales y networking.',
      location: 'Centro de Convenciones Norte',
      eventDate: new Date('2025-01-08T10:45:00'),
      mediaType: 'video',
      mediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      likes: 189,
      isLiked: true,
      cost: 0,
      currency: 'USA',
      category: "Art",
      attendees: 200,
      interested: 1000,
      userStatus: "attending",
      gallery: [
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      title: 'Festival Gastronómico Internacional',
      description: 'Degustación de cocina internacional, chefs reconocidos y talleres culinarios.',
      location: 'Parque Central, Zona Gastronómica',
      eventDate: new Date('2025-01-08T16:45:00'),
      mediaType: 'image',
      mediaUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 156,
      isLiked: false,
      cost: 100.00,
      currency: 'USA',
      category: "Cinema",
      attendees: 2000,
      interested: 1999,
      userStatus: "none",
      gallery: [
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
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