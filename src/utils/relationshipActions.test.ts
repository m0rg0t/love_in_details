import { describe, expect, it } from 'vitest';
import { getRelationshipAction } from './relationshipActions';

describe('relationship result actions', () => {
  it('returns a stable action for the same result and session', () => {
    expect(getRelationshipAction('balanced', 'session-42')).toEqual(
      getRelationshipAction('balanced', 'session-42'),
    );
  });

  it('uses copy that can be completed together today', () => {
    const action = getRelationshipAction('discovering', 'session-7');
    expect(action.title.length).toBeGreaterThan(5);
    expect(action.description.length).toBeGreaterThan(20);
  });
});
