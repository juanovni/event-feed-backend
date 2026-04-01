import bcryptjs from "bcryptjs";

interface SeedUser {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  username: string;
  description?: string;
  avatar: string;
  //isFollowing?: boolean;
  //interests: string[];
  role: 'admin' | 'user' | 'publisher';
}

interface SeeEvent {
  title: string;
  description: string;
  mediaType: ValidMediaType;
  mediaUrl: string;
  cost: number;
  currency: string;
  gallery?: string[];
  location: string;
  eventDate: Date;
  category: string;
  attendees: number;
  userStatus: 'attending' | 'interested' | 'none';
}
type ValidMediaType = 'image' | 'video';

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
      cost: 12.87,
      currency: 'USA',
      category: "Restaurant",
      attendees: 2,
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
      location: 'Urdesa Central Victor Emilio Estrada e Ilanes, Guayaquil, Ecuador',
      eventDate: new Date('2025-10-25T20:45:00'),
      mediaType: 'image',
      mediaUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/567878693_18533495350055152_460037855690789018_n.heic?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=Mzc0NzI0ODg0MjM2MzE2MDI0Mg%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=N7udmKqYXWAQ7kNvwFe_y5h&_nc_oc=AdnK8oegwtQJab82yo3HJHKQxbIfYzSHhZqWxy_UIkjS4ruiwaaPGzb0MQ9OqJ_Y7-Q&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=TZjiHpPoy_npdR555Y9Vlw&oh=00_AfeUcleSjLBxLB3MddhbaZwlBFAcoOoYugDjlFMGJdcwwg&oe=6900238C',
      cost: 15.00,
      currency: 'USA',
      category: "Bar",
      attendees: 0,
      userStatus: "none",
      gallery: [
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/355863/pexels-photo-355863.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      title: 'Festival Vallenatero',
      description: 'No te olvides de revisar nuestra agenda semanal esta llena de pura diversión 🔥🎉🕺🏼🎙️.',
      location: 'Urdesa Central Victor Emilio Estrada e Ilanes, Guayaquil, Ecuador',
      eventDate: new Date('2025-11-08T22:00:00'),
      mediaType: 'image',
      mediaUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/568024600_18533804185055152_3730086350854196634_n.heic?stp=dst-jpg_e35_tt6&_nc_cat=103&ig_cache_key=Mzc0ODY1MDU5MDk1Njk2NjE4NA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=BH4z_aBxkg0Q7kNvwGY_vhJ&_nc_oc=AdnPmoTDPpm-5SN_ZFrqTT9nvvoTdw_yDCT3LJ_7gXAL_I1I2A_FsS4W08BLmDSlkjQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=YG3dxaPHvjlzh0W1Ez-IgA&oh=00_Afc4ZZAL5A7Sg8xwJUj9rGaKytVmlWY96pIcgRN7-LoN8w&oe=69006C22',
      cost: 10.00,
      currency: 'USA',
      category: "Bar",
      attendees: 0,
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
      "name": "Juan Constantine",
      "email": "juan.constantine@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "juanConstantine",
      "avatar": "https://i.pravatar.cc/150?img=1",
      "role": "admin"
    },
    {
      "name": "José Murillo",
      "email": "jose.murillo@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "josémurillo",
      "avatar": "https://instagram.fgye1-1.fna.fbcdn.net/v/t51.2885-19/338453023_559074162992935_5894736553176390982_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fgye1-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QH4w-aoek9erQ4wyKKzqoyq3QNxkWKPh-IyRcpTvU45ik2xB-fWP4T_fhXjsojuD3s&_nc_ohc=32QNrsNAmG0Q7kNvwHSmh8d&_nc_gid=z7rsTiSN8Na7ym4K_KCTWQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfiXe7ZOA2V_rI4Ghz54CyM4CjZWJCVI1WMw1KxEj2RO9w&oe=6918A61A&_nc_sid=7a9f4b",
      "role": "user"
    },
    {
      "name": "Nicanor EC",
      "email": "nicanor.ec@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "nicanorec",
      "avatar": "https://pbs.twimg.com/profile_images/1443429332496621572/OJ5JizFo_400x400.jpg",
      "role": "publisher"
    },
    {
      "name": "Cantobar EC",
      "email": "cantobar.ec@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "cantobarec",
      "avatar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIGIU5ntOdRV4ROsEWUfqBLF8DV0L39rKKxQ&s",
      "role": "publisher"
    },
    {
      "name": "Sopla Running Club",
      "email": "sopla.running.ec@gmail.com",
      "description": "apto para todos ❤️‍🔥",
      "password": bcryptjs.hashSync('123456'),
      "username": "soplarunningclub",
      "avatar": "https://instagram.fgye1-1.fna.fbcdn.net/v/t51.82787-19/656363410_17938578657176841_8557407468337729683_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fgye1-1.fna.fbcdn.net&_nc_cat=109&_nc_oc=Q6cZ2gFTXMHLTguC4TNkRUIhNDp1_PeJE21O_1DZ_U4KSY30eZS1RU-73S9N8cLMhIk-Z8I&_nc_ohc=ycSJDIEwu9EQ7kNvwG49qHC&_nc_gid=aSkEBv8E6XtB_N4YJNDZMA&edm=APoiHPcBAAAA&ccb=7-5&oh=00_Af25XfLePeCYbukeGe_SA8Cx0btsCAX9lFxCiPBLySO_Rw&oe=69D30E13&_nc_sid=22de04",
      "role": "publisher"
    },
    {
      "name": "Camila Torres",
      "email": "camila.torres@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "camilatorres",
      "avatar": "https://i.pravatar.cc/150?img=3",
      "role": "user"
    }
  ],
  categories: [
    "Restaurante",
    "Música",
    "Bar",
    "Discoteca",
    "Deportes",
    "Arte",
    "Teatro",
    "Tecnología",
    "Moda",
    "Redes",
    "Festival",
    "Comida",
    "Cine",
    "Educación",
    "Bienestar",
    "Concierto"
  ]
}