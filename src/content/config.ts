import { defineCollection, z } from 'astro:content';

const baseSchema = z.object({
  title: z.string(),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  excerpt: z.string().optional(),
  source: z.string().optional(),
  notebook: z.string().optional(),
  generated: z.boolean().default(false),
  generator: z.enum(['quarto-html', 'quarto', 'ipynb-fallback']).optional(),
  sourceMtimeMs: z.number().optional(),
  sourceHash: z.string().optional(),
  bibliography: z
    .array(
      z.object({
        id: z.string(),
        author: z.string(),
        title: z.string(),
        year: z.string(),
        url: z.string().url().optional(),
      }),
    )
    .default([]),
  aliases: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const posts = defineCollection({
  type: 'content',
  schema: baseSchema,
});

const notes = defineCollection({
  type: 'content',
  schema: baseSchema,
});

export const collections = { posts, notes };
