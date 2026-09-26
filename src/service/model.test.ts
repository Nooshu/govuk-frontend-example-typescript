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
    assert.equal(stepById('name')?.path, '/name');
    assert.equal(stepById('missing'), undefined);
    assert.equal(stepByPath('/email')?.id, 'email');
    assert.equal(stepByPath('/missing'), undefined);
    assert.equal(nextStep('name')?.id, 'date-of-birth');
    assert.equal(nextStep('create-a-password'), undefined);
    assert.equal(nextStep('missing' as StepId), undefined);
    assert.equal(previousStep('name'), undefined);
    assert.equal(previousStep('date-of-birth')?.id, 'name');
    assert.equal(previousStep('missing' as StepId), undefined);
  });

  it('tracks required answers and ignores optional steps', () => {
    const application = createApplication();
    assert.equal(requiredStepsComplete(application), false);
    assert.equal(firstIncompleteStep(application)?.id, 'name');

    application.completed = markCompleted([], 'name');
    assert.deepEqual(markCompleted(application.completed, 'name'), ['name']);
    assert.deepEqual(unmarkCompleted(application.completed, 'name'), []);
    assert.deepEqual(unmarkCompleted(['email'], 'name'), ['email']);

    application.completed = [
      'name',
      'date-of-birth',
      'email',
      'contact-preference',
      'where-you-will-fish',
      'licence-length',
      'start-month',
      'address',
      'create-a-password',
    ];
    assert.equal(requiredStepsComplete(application), true);
    assert.equal(firstIncompleteStep(application), undefined);
  });
});
