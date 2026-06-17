const { z } = require('zod');

const ProjectStatus = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
  status: ProjectStatus.optional().default('NOT_STARTED'),
  startDate: z
    .preprocess((val) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date().optional()),
  endDate: z
    .preprocess((val) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date().optional()),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, { message: 'End date must be on or after start date', path: ['endDate'] });

const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100)
    .optional(),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable(),
  status: ProjectStatus.optional(),
  startDate: z
    .preprocess((val) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date().optional()),
  endDate: z
    .preprocess((val) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date().optional()),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, { message: 'End date must be on or after start date', path: ['endDate'] });

module.exports = { createProjectSchema, updateProjectSchema };
