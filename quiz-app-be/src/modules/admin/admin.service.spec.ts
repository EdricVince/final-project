import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService.deleteUser — transactional cascade', () => {
  it('throws NotFound when the user does not exist', async () => {
    const userRepo = { findOne: jest.fn().mockResolvedValue(null) } as any;
    const service = new AdminService(userRepo, {} as any);
    await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
  });

  it('deletes every user-related table inside one transaction, user last', async () => {
    const deleted: string[] = [];
    const manager = {
      // one owned class → its enrollments + the class get removed
      find: jest.fn().mockResolvedValue([{ id: 5 }]),
      delete: jest.fn().mockImplementation((entity: any) => {
        deleted.push(entity.name);
        return Promise.resolve({});
      }),
    };
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      manager: { transaction: jest.fn().mockImplementation((cb: any) => cb(manager)) },
    } as any;
    const service = new AdminService(userRepo, {} as any);

    await service.deleteUser(1);

    // Every table that references a user is cleared...
    expect(deleted).toEqual(
      expect.arrayContaining([
        'ClassEnrollment',
        'Class',
        'Video',
        'Lesson',
        'LiveSession',
        'UserProgress',
        'DailyActivity',
        'UserGoalSettings',
        'UserCustomGoal',
        'User',
      ]),
    );
    // ...and the account row itself is deleted last, so nothing is orphaned.
    expect(deleted[deleted.length - 1]).toBe('User');
    expect(userRepo.manager.transaction).toHaveBeenCalledTimes(1);
  });
});
