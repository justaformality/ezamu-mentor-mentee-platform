/*
auth-routing.spec.ts

To run:

    - run front end
    - run back end
    - third terminal in front end:
        npm i -D @playwright/test
        npx playwright install
        npx playwright test --headed


*/

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Full Auth + Profile Flow', () => {

  test('signup -> login -> redirect works', async ({ page }) => {
    const email = `user_${Date.now()}@test.com`;
    const password = 'test1234';

    await page.goto(`${BASE}/signup`);

    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.selectOption('select[name="role"]', 'student');

    await page.click('button:has-text("Sign Up")');

    await page.waitForURL(/student-registration/);

    await page.goto(`${BASE}/signin`);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/student-dashboard/);
  });

  test('wrong password is rejected', async ({ page }) => {
    const email = `user_${Date.now()}@test.com`;
    const password = 'test1234';

    await page.goto(`${BASE}/signup`);

    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);

    await page.click('button:has-text("Sign Up")');

    await page.goto(`${BASE}/signin`);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'wrong');

    await page.click('button:has-text("Sign In")');

    // Handle alert popup
    let dialogMessage = "";
    page.once("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Confirm the alert was the expected one
    await expect.poll(() => dialogMessage).toContain("Invalid email or password");

    // Confirm user did NOT log in
    await expect(page).toHaveURL(/\/signin$/);
    await expect(page).not.toHaveURL(/\/student-dashboard$/);
    await expect(page).not.toHaveURL(/\/coach-dashboard$/);
  });

  test('coach routing works', async ({ page }) => {
    const email = `coach_${Date.now()}@test.com`;
    const password = 'test1234';

    await page.goto(`${BASE}/signup`);

    await page.fill('input[name="fullName"]', 'Coach User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.selectOption('select[name="role"]', 'coach');

    await page.click('button:has-text("Sign Up")');

    await page.waitForURL(/coach-registration/);

    await page.goto(`${BASE}/signin`);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/coach-dashboard/);
  });

  test('change email works', async ({ page }) => {
    const email = `user_${Date.now()}@test.com`;
    const newEmail = `new_${Date.now()}@test.com`;
    const password = 'test1234';

    await page.goto(`${BASE}/signup`);

    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.selectOption('select[name="role"]', 'student');

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL(/student-registration/);

    await page.goto(`${BASE}/profile`);

    await page.fill('#new-email', newEmail);
    await page
      .locator('form')
      .filter({ has: page.locator('#new-email') })
      .getByRole('button', { name: 'Change' })
      .click();

    await expect(page.locator('text=/Email changed/i')).toBeVisible();
    await page.waitForURL(/signin/, { timeout: 4000 });

    await page.fill('input[name="email"]', newEmail);
    await page.fill('input[name="password"]', password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/student-dashboard/);
  });

  test('change password works', async ({ page }) => {
    const email = `user_${Date.now()}@test.com`;
    const password = 'test1234';
    const newPassword = 'newpass1234';

    await page.goto(`${BASE}/signup`);

    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.selectOption('select[name="role"]', 'student');

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL(/student-registration/);

    await page.goto(`${BASE}/profile`);

    await page.fill('#current-pw', password);
    await page.fill('#new-pw', newPassword);
    await page
      .locator('form')
      .filter({ has: page.locator('#current-pw') })
      .getByRole('button', { name: 'Change' })
      .click();

    await expect(page.locator('text=/Password changed|Password updated/i')).toBeVisible();
    await page.waitForURL(/signin/, { timeout: 4000 });

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', newPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/student-dashboard/);
  });

  test('profile picture upload works', async ({ page }) => {
    const email = `user_${Date.now()}@test.com`;
    const password = 'test1234';

    await page.goto(`${BASE}/signup`);

    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.selectOption('select[name="role"]', 'student');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    // signup currently sends students here first
    await page.waitForURL(/student-registration/);

    // then continue to the proper dashboard
    await page.goto(`${BASE}/student-dashboard`);
    await expect(page).toHaveURL(/student-dashboard/);

    // now go to profile
    await page.goto(`${BASE}/profile`);

    await page.getByRole('button', { name: 'Change Profile Picture' }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/test.png');

    await page.getByRole('button', { name: 'Confirm' }).click();

    // verify localStorage got updated
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.profile_pic_url || '';
      });
    }).not.toBe('');

    // verify the image element is showing something
    const profileImg = page.locator('img[alt="Profile"]');
    await expect(profileImg).toBeVisible();

    await expect.poll(async () => {
      return await profileImg.getAttribute('src');
    }).not.toBeNull();
  });

});