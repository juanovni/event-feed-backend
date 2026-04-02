import slugify from "slugify";

export const generateSlug = (title: string) => {
  return slugify(title, {
    lower: true,
    strict: true, // elimina caracteres raros
    trim: true,
  });
};