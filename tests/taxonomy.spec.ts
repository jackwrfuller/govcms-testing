import { test, expect } from '@playwright/test';

/**
 * Set up and test functionality of 'Taxonomy' module on GovCMS site.
 *
 * Prerequisites:
 *   - User logged in as Site Admin (Administrator)
 *   - User is on /admin/structure/taxonomy
 */
test.describe('Taxonomy module functionality', () => {
  test.describe.configure({ mode: 'serial' });

  const suffix = Math.random().toString(36).slice(2, 7);
  const vocabName = `vocab${suffix}`;
  const vocabDescription = 'Initial description for test vocabulary';
  const updatedDescription = 'Updated description for test vocabulary';
  const termName = `term ${suffix}`;
  const secondVocabName = `vocab2${suffix}`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/structure/taxonomy');
  });

  test('create a new vocabulary', async ({ page }) => {
    await page.getByRole('link', { name: 'Add vocabulary' }).click();
    await expect(page).toHaveURL(/\/admin\/structure\/taxonomy\/add/);

    await page.locator('#edit-name').fill(vocabName);
    await page.locator('#edit-vid').fill(vocabName);
    await page.locator('#edit-description').fill(vocabDescription);
    await page.locator('#edit-submit').click({ force: true });

    await expect(page.getByText('Created new vocabulary')).toBeVisible();
  });

  test('edit vocabulary description', async ({ page }) => {
    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });
    await vocabRow.getByRole('button', { name: 'List additional actions' }).click();
    await vocabRow.getByRole('link', { name: `Edit ${vocabName}` }).click();

    await page.getByLabel('Description').fill(updatedDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Updated vocabulary')).toBeVisible();
  });

  test('add a term to the vocabulary', async ({ page }) => {
    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });
    await vocabRow.getByRole('button', { name: 'List additional actions' }).click();
    await page.getByRole('link', { name: 'Add terms' }).click();

    await page.locator('#edit-name-0-value').fill(termName);
    await page.locator('#edit-submit').click();

    await expect(page.getByText('Created new term')).toBeVisible();
  });

  test('create additional vocabularies', async ({ page }) => {
    await page.getByRole('link', { name: 'Add vocabulary' }).click();

    await page.locator('#edit-name').fill(secondVocabName);
    await page.locator('#edit-vid').fill(secondVocabName);
    await page.locator('#edit-description').fill(vocabDescription);
    await page.locator('#edit-submit').click({ force: true });

    await expect(page.getByText('Created new vocabulary')).toBeVisible();
  });

  test('reorder vocabularies', async ({ page }) => {
    const showWeightsButton = page.getByRole('button', { name: 'Show row weights' });
    if (await showWeightsButton.isVisible()) {
      await showWeightsButton.click();
    }

    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });
    const weightSelect = vocabRow.locator('select[name*="weight"]');
    await weightSelect.selectOption({ index: 0 });
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText('The configuration options have been saved.')
    ).toBeVisible();
  });

  test('delete vocabularies', async ({ page }) => {
    for (const name of [secondVocabName, vocabName]) {
      const vocabRow = page.locator('tr', { has: page.getByText(name) });
      await vocabRow.getByRole('button', { name: 'List additional actions' }).click();
      await vocabRow.getByRole('link', { name: `Delete ${name}` }).click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('Deleted vocabulary')).toBeVisible();

      await page.goto('/admin/structure/taxonomy');
    }
  });
});
