/*


Update log:
Last updated        | Version of main.py tested      | Test cases passed      | OS        | Errors noted
---------------------------------------------------------------------------------------------------------
Mar 2 @ 438pm       | Mar 2, Commit 5d07e49          | 0/2                    | Windows   | No POST /auth/login request sent by frontend 
                                                                                            (everything done client-side)
Mar 16 @ 5:05pm     | Mar 2, Commit 5d07e49          | 1/2                    | Windows   | Password check passes, wrong redirect for coaches


To run:

    - run front end
    - run back end
    - third terminal in front end:
        npm i -D @playwright/test
        npx playwright install
        npx playwright test --headed


*/

import { test, expect } from "@playwright/test";

function uniqueEmail(prefix: string) {
  const id = Date.now().toString() + "-" + Math.random().toString(16).slice(2);
  return `${prefix}-${id}@example.com`;
}

async function hardLogout(page: any) {
  // Reliable "logout" even if UI button isn't present
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

async function expectAuthLoginRequest(page: any, timeoutMs = 5000) {
  try {
    await page.waitForRequest(
      (req: any) => req.method() === "POST" && req.url().includes("/auth/login"),
      { timeout: timeoutMs }
    );
  } catch {
    throw new Error(
      "No POST /auth/login request was sent by the frontend. " +
        "This means the UI is not using the backend for login (client-side navigation)."
    );
  }
}

test("Case 1: coach relogin should land on coach dashboard (not student)", async ({ page }) => {
  const email = uniqueEmail("coach");
  const password = "pass1234";

  // Sign up (coach-equivalent role in your UI is 'mentor')
  await page.goto("/signup");
  await page.fill('input[name="fullName"]', "Playwright Coach");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // IMPORTANT: in your UI, the 'coach/counselor' option value is "mentor"
  await page.selectOption('select[name="role"]', "mentor");

  await page.click('button[type="submit"]');

  // Your signup page routes mentor -> /coach-dashboard
  await expect(page).toHaveURL(/\/coach-dashboard$/);

  // Logout (robust)
  await hardLogout(page);

  // Re-login
  await page.goto("/signin");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Clicking Sign In should trigger a backend login call; currently it doesn't.
  const clickPromise = page.click('button[type="submit"]');
  await Promise.all([clickPromise]);

  // Assert frontend actually calls backend for login
  await expectAuthLoginRequest(page);

  // Expected behavior: coach goes to coach dashboard
  await expect(page).toHaveURL(/\/coach-dashboard$/);

  // Explicit fail condition:
  await expect(page).not.toHaveURL(/\/student-dashboard$/);
});

test("Case 2: wrong password must not log in", async ({ page }) => {
  const email = uniqueEmail("student");
  const password = "pass1234";
  const wrongPassword = "abc123";

  // Sign up as student
  await page.goto("/signup");
  await page.fill('input[name="fullName"]', "Playwright Student");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.selectOption('select[name="role"]', "student");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/student-dashboard$/);

  // Logout (robust)
  await hardLogout(page);

  // Attempt login with wrong password
  await page.goto("/signin");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', wrongPassword);
  await page.click('button[type="submit"]');

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