import bcryptjs from "bcryptjs";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  username: string;
  description: string;
  avatar: string;
  //isFollowing?: boolean;
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
      title: 'Noche de Week y Bebidas',
      description: 'Este año ha sido el año de los recuerdos, para Negroni Week, seguimos la ruta. Los 3 Negronis más queridos de nuestras 3 primeras celebraciones junto una nueva forma de armar tu propio Negroni: AL AZAR 🎲 🎲 ⭕️',
      location: 'Plaza Mayor, Centro Histórico',
      eventDate: new Date('2025-01-08T06:45:00'),
      mediaType: 'image',
      mediaUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/554396372_18063879602584200_8012309436171417339_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ig_cache_key=MzcyODgwOTQ2OTc0OTg3OTg1MA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTM1MC5zZHIuQzMifQ%3D%3D&_nc_ohc=QPs5BUzA1EsQ7kNvwEMnyo5&_nc_oc=AdmZISybg8Ow5iLBnYYY_3KVG_Dc7N0vZxqrwHdOhfwsDnFRASFkSyb5HAU1omH840Y&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=2DbznfQ2I5ug7Ls3pEhqnw&oh=00_AfcJFex9AHhNLMn2xW70J4uVCjr_jfxlvxXG9Ds-NWxelg&oe=6900316E',
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
      title: 'Tributo Mexicano - Con Julio Parrales',
      description: 'Reserva tu mesa 📲0967660358 Celebra tu cumpleaños o cualquier ocasión especial con nosotros 🥂🍸🎂🍾 ',
      location: 'Urdesa Central',
      eventDate: new Date('2025-10-25T20:45:00'),
      mediaType: 'image',
      mediaUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/567878693_18533495350055152_460037855690789018_n.heic?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=Mzc0NzI0ODg0MjM2MzE2MDI0Mg%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=N7udmKqYXWAQ7kNvwFe_y5h&_nc_oc=AdnK8oegwtQJab82yo3HJHKQxbIfYzSHhZqWxy_UIkjS4ruiwaaPGzb0MQ9OqJ_Y7-Q&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=TZjiHpPoy_npdR555Y9Vlw&oh=00_AfeUcleSjLBxLB3MddhbaZwlBFAcoOoYugDjlFMGJdcwwg&oe=6900238C',
      likes: 0,
      isLiked: false,
      cost: 10,
      currency: 'USA',
      category: "Bar",
      attendees: 0,
      interested: 0,
      userStatus: "none",
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
      description: '',
      password: bcryptjs.hashSync('123456'),
      username: 'juanConstantine',
      avatar: '',
      interests: ['restaurant'],
      role: 'admin',
    },
    {
      name: 'Jose Murillo',
      email: 'jose@gmail.com',
      description: '',
      password: bcryptjs.hashSync('123456'),
      username: 'joseMurillo',
      avatar: '',
      interests: ['music'],
      role: 'user',
    },
    {
      name: 'nicanorec',
      description: 'NICANOR • CASA DE BEBIDAS •',
      email: 'nicanor@gmail.com',
      password: bcryptjs.hashSync('123456'),
      username: 'nicanorec',
      avatar: 'https://pbs.twimg.com/profile_images/1443429332496621572/OJ5JizFo_400x400.jpg',
      interests: ['restaurant'],
      role: 'publisher',
    },
    {
      name: 'cantobar.ec',
      description: 'CANTO BAR ÚNICA Cuenta Oficial® AfterOffice-Karaoke-Guayaquil',
      email: 'cantobar@gmail.com',
      password: bcryptjs.hashSync('123456'),
      username: 'cantobar.ec',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIGIU5ntOdRV4ROsEWUfqBLF8DV0L39rKKxQ&s',
      interests: ['restaurant'],
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