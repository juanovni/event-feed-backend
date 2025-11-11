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
      "interests": [
        "restaurant"
      ],
      "role": "admin"
    },
    {
      "name": "José Murillo",
      "email": "jose.murillo@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "josémurillo",
      "avatar": "https://instagram.fgye1-1.fna.fbcdn.net/v/t51.2885-19/338453023_559074162992935_5894736553176390982_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fgye1-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QH4w-aoek9erQ4wyKKzqoyq3QNxkWKPh-IyRcpTvU45ik2xB-fWP4T_fhXjsojuD3s&_nc_ohc=32QNrsNAmG0Q7kNvwHSmh8d&_nc_gid=z7rsTiSN8Na7ym4K_KCTWQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfiXe7ZOA2V_rI4Ghz54CyM4CjZWJCVI1WMw1KxEj2RO9w&oe=6918A61A&_nc_sid=7a9f4b",
      "interests": [
        "nature"
      ],
      "role": "user"
    },
    {
      "name": "Nicanor EC",
      "email": "nicanor.ec@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "nicanorec",
      "avatar": "https://pbs.twimg.com/profile_images/1443429332496621572/OJ5JizFo_400x400.jpg",
      "interests": [
        "fitness"
      ],
      "role": "publisher"
    },
    {
      "name": "Cantobar EC",
      "email": "cantobar.ec@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "cantobarec",
      "avatar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIGIU5ntOdRV4ROsEWUfqBLF8DV0L39rKKxQ&s",
      "interests": [
        "fitness"
      ],
      "role": "publisher"
    },
    {
      "name": "Camila Torres",
      "email": "camila.torres@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "camilatorres",
      "avatar": "https://i.pravatar.cc/150?img=3",
      "interests": [
        "fashion"
      ],
      "role": "user"
    },
    {
      "name": "Luis García",
      "email": "luis.garcía@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "luisgarcía",
      "avatar": "https://i.pravatar.cc/150?img=4",
      "interests": [
        "sports"
      ],
      "role": "user"
    },
    {
      "name": "Valentina Pérez",
      "email": "valentina.pérez@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "valentinapérez",
      "avatar": "https://i.pravatar.cc/150?img=5",
      "interests": [
        "tech"
      ],
      "role": "user"
    },
    {
      "name": "Mateo Rojas",
      "email": "mateo.rojas@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "mateorojas",
      "avatar": "https://i.pravatar.cc/150?img=6",
      "interests": [
        "nature"
      ],
      "role": "user"
    },
    {
      "name": "Sofía León",
      "email": "sofía.león@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "sofíaleón",
      "avatar": "https://i.pravatar.cc/150?img=7",
      "interests": [
        "art"
      ],
      "role": "user"
    },
    {
      "name": "Carlos Rivera",
      "email": "carlos.rivera@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "carlosrivera",
      "avatar": "https://i.pravatar.cc/150?img=8",
      "interests": [
        "sports"
      ],
      "role": "user"
    },
    {
      "name": "Fernanda Díaz",
      "email": "fernanda.díaz@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "fernandadíaz",
      "avatar": "https://i.pravatar.cc/150?img=9",
      "interests": [
        "fashion"
      ],
      "role": "publisher"
    },
    {
      "name": "Ricardo Salas",
      "email": "ricardo.salas@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "ricardosalas",
      "avatar": "https://i.pravatar.cc/150?img=10",
      "interests": [
        "travel"
      ],
      "role": "user"
    },
    {
      "name": "María Paredes",
      "email": "maría.paredes@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "maríaparedes",
      "avatar": "https://i.pravatar.cc/150?img=11",
      "interests": [
        "fashion"
      ],
      "role": "publisher"
    },
    {
      "name": "Andrés López",
      "email": "andrés.lópez@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "andréslópez",
      "avatar": "https://i.pravatar.cc/150?img=12",
      "interests": [
        "reading"
      ],
      "role": "user"
    },
    {
      "name": "Daniela Roldán",
      "email": "daniela.roldán@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "danielaroldán",
      "avatar": "https://i.pravatar.cc/150?img=13",
      "interests": [
        "tech"
      ],
      "role": "user"
    },
    {
      "name": "Javier Cedeño",
      "email": "javier.cedeño@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "javiercedeño",
      "avatar": "https://i.pravatar.cc/150?img=14",
      "interests": [
        "nature"
      ],
      "role": "user"
    },
    {
      "name": "Paola Ortega",
      "email": "paola.ortega@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "paolaortega",
      "avatar": "https://i.pravatar.cc/150?img=15",
      "interests": [
        "reading"
      ],
      "role": "user"
    },
    {
      "name": "Eduardo Molina",
      "email": "eduardo.molina@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "eduardomolina",
      "avatar": "https://i.pravatar.cc/150?img=16",
      "interests": [
        "tech"
      ],
      "role": "publisher"
    },
    {
      "name": "Gabriela Vega",
      "email": "gabriela.vega@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "gabrielavega",
      "avatar": "https://i.pravatar.cc/150?img=17",
      "interests": [
        "travel"
      ],
      "role": "user"
    },
    {
      "name": "Juan Castillo",
      "email": "juan.castillo@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "juancastillo",
      "avatar": "https://i.pravatar.cc/150?img=18",
      "interests": [
        "art"
      ],
      "role": "publisher"
    },
    {
      "name": "Natalia Herrera",
      "email": "natalia.herrera@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "nataliaherrera",
      "avatar": "https://i.pravatar.cc/150?img=19",
      "interests": [
        "art"
      ],
      "role": "user"
    },
    {
      "name": "Sebastián Bravo",
      "email": "sebastián.bravo@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "sebastiánbravo",
      "avatar": "https://i.pravatar.cc/150?img=20",
      "interests": [
        "music"
      ],
      "role": "user"
    },
    {
      "name": "Laura Aguirre",
      "email": "laura.aguirre@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "lauraaguirre",
      "avatar": "https://i.pravatar.cc/150?img=21",
      "interests": [
        "music"
      ],
      "role": "user"
    },
    {
      "name": "Felipe Torres",
      "email": "felipe.torres@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "felipetorres",
      "avatar": "https://i.pravatar.cc/150?img=22",
      "interests": [
        "fitness"
      ],
      "role": "publisher"
    },
    {
      "name": "Andrea Márquez",
      "email": "andrea.márquez@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "andreamárquez",
      "avatar": "https://i.pravatar.cc/150?img=23",
      "interests": [
        "sports"
      ],
      "role": "publisher"
    },
    {
      "name": "Diego Zamora",
      "email": "diego.zamora@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "diegozamora",
      "avatar": "https://i.pravatar.cc/150?img=24",
      "interests": [
        "nature"
      ],
      "role": "publisher"
    },
    {
      "name": "Elena Ríos",
      "email": "elena.ríos@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "elenaríos",
      "avatar": "https://i.pravatar.cc/150?img=25",
      "interests": [
        "nature"
      ],
      "role": "publisher"
    },
    {
      "name": "Manuel Ruiz",
      "email": "manuel.ruiz@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "manuelruiz",
      "avatar": "https://i.pravatar.cc/150?img=26",
      "interests": [
        "travel"
      ],
      "role": "user"
    },
    {
      "name": "Victoria Herrera",
      "email": "victoria.herrera@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "victoriaherrera",
      "avatar": "https://i.pravatar.cc/150?img=27",
      "interests": [
        "nature"
      ],
      "role": "user"
    },
    {
      "name": "Fernando Peña",
      "email": "fernando.peña@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "fernandopeña",
      "avatar": "https://i.pravatar.cc/150?img=28",
      "interests": [
        "sports"
      ],
      "role": "user"
    },
    {
      "name": "Isabella Flores",
      "email": "isabella.flores@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "isabellaflores",
      "avatar": "https://i.pravatar.cc/150?img=29",
      "interests": [
        "music"
      ],
      "role": "user"
    },
    {
      "name": "Pablo Sánchez",
      "email": "pablo.sánchez@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "pablosánchez",
      "avatar": "https://i.pravatar.cc/150?img=30",
      "interests": [
        "fashion"
      ],
      "role": "user"
    },
    {
      "name": "Claudia Cabrera",
      "email": "claudia.cabrera@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "claudiacabrera",
      "avatar": "https://i.pravatar.cc/150?img=31",
      "interests": [
        "nature"
      ],
      "role": "user"
    },
    {
      "name": "Hugo Medina",
      "email": "hugo.medina@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "hugomedina",
      "avatar": "https://i.pravatar.cc/150?img=32",
      "interests": [
        "art"
      ],
      "role": "user"
    },
    {
      "name": "Alejandra Mora",
      "email": "alejandra.mora@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "alejandramora",
      "avatar": "https://i.pravatar.cc/150?img=33",
      "interests": [
        "fashion"
      ],
      "role": "user"
    },
    {
      "name": "Santiago Cruz",
      "email": "santiago.cruz@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "santiagocruz",
      "avatar": "https://i.pravatar.cc/150?img=34",
      "interests": [
        "reading"
      ],
      "role": "publisher"
    },
    {
      "name": "Patricia Lara",
      "email": "patricia.lara@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "patricialara",
      "avatar": "https://i.pravatar.cc/150?img=35",
      "interests": [
        "nature"
      ],
      "role": "user"
    },
    {
      "name": "Emilio Correa",
      "email": "emilio.correa@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "emiliocorrea",
      "avatar": "https://i.pravatar.cc/150?img=36",
      "interests": [
        "fashion"
      ],
      "role": "publisher"
    },
    {
      "name": "Lucía Delgado",
      "email": "lucía.delgado@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "lucíadelgado",
      "avatar": "https://i.pravatar.cc/150?img=37",
      "interests": [
        "tech"
      ],
      "role": "publisher"
    },
    {
      "name": "Mario Pino",
      "email": "mario.pino@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "mariopino",
      "avatar": "https://i.pravatar.cc/150?img=38",
      "interests": [
        "fitness"
      ],
      "role": "user"
    },
    {
      "name": "Carla Reyes",
      "email": "carla.reyes@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "carlareyes",
      "avatar": "https://i.pravatar.cc/150?img=39",
      "interests": [
        "sports"
      ],
      "role": "publisher"
    },
    {
      "name": "Bruno Aguilar",
      "email": "bruno.aguilar@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "brunoaguilar",
      "avatar": "https://i.pravatar.cc/150?img=40",
      "interests": [
        "fitness"
      ],
      "role": "user"
    },
    {
      "name": "Rosa Morales",
      "email": "rosa.morales@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "rosamorales",
      "avatar": "https://i.pravatar.cc/150?img=41",
      "interests": [
        "tech"
      ],
      "role": "user"
    },
    {
      "name": "David Cárdenas",
      "email": "david.cárdenas@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "davidcárdenas",
      "avatar": "https://i.pravatar.cc/150?img=42",
      "interests": [
        "art"
      ],
      "role": "publisher"
    },
    {
      "name": "Angela Torres",
      "email": "angela.torres@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "angelatorres",
      "avatar": "https://i.pravatar.cc/150?img=43",
      "interests": [
        "art"
      ],
      "role": "publisher"
    },
    {
      "name": "Martín Serrano",
      "email": "martín.serrano@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "martínserrano",
      "avatar": "https://i.pravatar.cc/150?img=44",
      "interests": [
        "art"
      ],
      "role": "user"
    },
    {
      "name": "Mónica Jiménez",
      "email": "mónica.jiménez@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "mónicajiménez",
      "avatar": "https://i.pravatar.cc/150?img=45",
      "interests": [
        "restaurant"
      ],
      "role": "publisher"
    },
    {
      "name": "Tomás Paredes",
      "email": "tomás.paredes@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "tomásparedes",
      "avatar": "https://i.pravatar.cc/150?img=46",
      "interests": [
        "fitness"
      ],
      "role": "user"
    },
    {
      "name": "Verónica Silva",
      "email": "verónica.silva@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "verónicasilva",
      "avatar": "https://i.pravatar.cc/150?img=47",
      "interests": [
        "sports"
      ],
      "role": "publisher"
    },
    {
      "name": "Héctor Castro",
      "email": "héctor.castro@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "héctorcastro",
      "avatar": "https://i.pravatar.cc/150?img=48",
      "interests": [
        "tech"
      ],
      "role": "publisher"
    },
    {
      "name": "Luciana Fajardo",
      "email": "luciana.fajardo@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "lucianafajardo",
      "avatar": "https://i.pravatar.cc/150?img=49",
      "interests": [
        "art"
      ],
      "role": "user"
    },
    {
      "name": "Rodrigo León",
      "email": "rodrigo.león@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "rodrigoleón",
      "avatar": "https://i.pravatar.cc/150?img=50",
      "interests": [
        "music"
      ],
      "role": "publisher"
    },
    {
      "name": "Camilo Acosta",
      "email": "camilo.acosta@gmail.com",
      "description": "",
      "password": bcryptjs.hashSync('123456'),
      "username": "camiloacosta",
      "avatar": "https://i.pravatar.cc/150?img=51",
      "interests": [
        "art"
      ],
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
  ],
}