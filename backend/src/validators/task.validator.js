const { z } = require('zod');

const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const TaskStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(100, 'Task title must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
  priority: TaskPriority.optional().default('MEDIUM'),
  status: TaskStatus.optional().default('PENDING'),
  dueDate: z
    .preprocess((val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }, z.date().nullable().optional()),
  projectId: z
    .preprocess((val) => (val ? Number(val) : undefined), z
      .number({ required_error: 'projectId is required' })
      .int()
      .positive('projectId must be a positive integer')),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(100)
    .optional(),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable(),
  priority: TaskPriority.optional(),
  status: TaskStatus.optional(),
  dueDate: z
    .preprocess((val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }, z.date().nullable().optional()),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
