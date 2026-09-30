import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createApplication,
  firstIncompleteStep,
  markCompleted,
  nextStep,
  previousStep,
  requiredStepsComplete,
  stepById,
  stepByPath,
  unmarkCompleted,
  type StepId,
} from './model.js';

describe('application model', () => {
  it('walks the question sequence', () => {
    assert.equal(stepById('licence-length')?.path, '/licence-length');
    assert.equal(stepById('missing'), undefined);
    assert.equal(stepByPath('/email')?.id, 'email');
    assert.equal(stepByPath('/missing'), undefined);
    assert.equal(nextStep('licence-length')?.id, 'name');
    assert.equal(nextStep('email'), undefined);
    assert.equal(nextStep('missing' as StepId), undefined);
    assert.equal(previousStep('licence-length'), undefined);
    assert.equal(previousStep('name')?.id, 'licence-length');
    assert.equal(previousStep('missing' as StepId), undefined);
  });

  it('tracks required answers', () => {
    const application = createApplication();
    assert.equal(requiredStepsComplete(application), false);
    assert.equal(firstIncompleteStep(application)?.id, 'licence-length');

    application.completed = markCompleted([], 'licence-length');
    assert.deepEqual(markCompleted(application.completed, 'licence-length'), ['licence-length']);
    assert.deepEqual(unmarkCompleted(application.completed, 'licence-length'), []);
    assert.deepEqual(unmarkCompleted(['email'], 'name'), ['email']);

    application.completed = [
      'licence-length',
      'name',
      'date-of-birth',
      'where-you-will-fish',
      'email',
    ];
    assert.equal(requiredStepsComplete(application), true);
    assert.equal(firstIncompleteStep(application), undefined);
  });
});
