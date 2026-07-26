import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restrict a route/controller to the given role IDs (see ROLE_STUDENT/TEACHER/ADMIN). */
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
