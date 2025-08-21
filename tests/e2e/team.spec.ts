import { test, expect } from '@playwright/test';

test.describe('Team', () => {
  test('should load the team index page correctly', async ({ page }) => {
    // Navigate to the team index page
    await page.goto('/team');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Team - OneLiteFeather.net/);

    // Check that the team header is visible
    const teamHeader = page.locator('h1').first();
    await expect(teamHeader).toBeVisible();

    // Check that there are team ranks/sections
    const teamSections = page.locator('section.team-rank, .team-section');
    await expect(teamSections).toHaveCount({ min: 1 });

    // Check that each section has a title
    const firstSection = teamSections.first();
    await expect(firstSection.locator('h2')).toBeVisible();

    // Check that there are team members
    const teamMembers = page.locator('.team-member, .member-card');
    await expect(teamMembers).toHaveCount({ min: 1 });

    // Check that each team member has a name
    const firstMember = teamMembers.first();
    await expect(firstMember.locator('h3, .member-name')).toBeVisible();
  });

  test('should navigate to a team member and display their profile or author page', async ({ page }) => {
    // Navigate to the team index page
    await page.goto('/team');

    // Click on the first team member
    const firstMemberLink = page.locator('.team-member a, .member-card a').first();
    const memberName = await firstMemberLink.locator('h3, .member-name').textContent();
    await firstMemberLink.click();

    // Wait for the team member page to load
    await page.waitForLoadState('networkidle');

    // Check that the page title contains the team member name
    await expect(page).toHaveTitle(new RegExp(memberName || ''));

    // Check that the team member has a name that matches the one we clicked
    const memberNameOnPage = page.locator('h1').first();
    await expect(memberNameOnPage).toHaveText(new RegExp(memberName || ''));

    // Check for profile image - should be present on both team member and author pages
    const profileImage = page.locator('.profile-image, img[alt*="profile"], img[alt*="avatar"]');
    await expect(profileImage).toBeVisible();

    // Check if we're on an author page or a team member page
    const currentUrl = page.url();
    if (currentUrl.includes('/authors/')) {
      // We're on an author page
      console.log('Redirected to author page for team member');

      // Check for author-specific elements
      const authorProfile = page.locator('.container');
      await expect(authorProfile).toBeVisible();

      // Check for about section if it exists
      const about = page.locator('h2:has-text("About")');
      if (await about.count() > 0) {
        await expect(about).toBeVisible();
      }
    } else {
      // We're on a team member page
      console.log('Displaying team member profile');

      // Check that the team member profile is visible
      const memberProfile = page.locator('.team-member-profile, .member-profile');
      await expect(memberProfile).toBeVisible();

      // Check for member bio if it exists
      const bio = page.locator('.bio, .member-bio');
      if (await bio.count() > 0) {
        await expect(bio).toBeVisible();
      }

      // Check for member rank
      const rank = page.locator('.rank, .member-rank');
      if (await rank.count() > 0) {
        await expect(rank).toBeVisible();
      }
    }
  });

  test('should display team member projects if they exist', async ({ page }) => {
    // Navigate to the team index page
    await page.goto('/team');

    // Click on the first team member
    const firstMemberLink = page.locator('.team-member a, .member-card a').first();
    await firstMemberLink.click();

    // Wait for the team member page to load
    await page.waitForLoadState('networkidle');

    // Check for member projects
    const projects = page.locator('.member-projects, .projects-section');
    if (await projects.count() > 0) {
      await expect(projects).toBeVisible();

      // Check if there are any project items
      const projectItems = projects.locator('.project-item, .project-card');
      if (await projectItems.count() > 0) {
        await expect(projectItems.first()).toBeVisible();

        // Check that project items have titles
        await expect(projectItems.first().locator('h3, .project-title')).toBeVisible();
      }
    }
  });

  test('should display team member blog posts if they exist', async ({ page }) => {
    // Navigate to the team index page
    await page.goto('/team');

    // Click on the first team member
    const firstMemberLink = page.locator('.team-member a, .member-card a').first();
    await firstMemberLink.click();

    // Wait for the team member page to load
    await page.waitForLoadState('networkidle');

    // Check for member blog posts
    const blogPosts = page.locator('.member-blog-posts, .blog-posts-section');
    if (await blogPosts.count() > 0) {
      await expect(blogPosts).toBeVisible();

      // Check if there are any blog post items
      const blogPostItems = blogPosts.locator('.blog-post-item, .post-card');
      if (await blogPostItems.count() > 0) {
        await expect(blogPostItems.first()).toBeVisible();

        // Check that blog post items have titles
        await expect(blogPostItems.first().locator('h3, .post-title')).toBeVisible();
      }
    }
  });

  test('should have working language switcher on team member profiles', async ({ page }) => {
    // Navigate to the team index page
    await page.goto('/team');

    // Click on the first team member
    const firstMemberLink = page.locator('.team-member a, .member-card a').first();
    await firstMemberLink.click();

    // Wait for the team member page to load
    await page.waitForLoadState('networkidle');

    // Find the language switcher
    const languageSwitcher = page.locator('[aria-label="Language Switcher"]').first();
    await expect(languageSwitcher).toBeVisible();

    // Click the language switcher
    await languageSwitcher.click();

    // Find and click the English option (assuming default is German)
    const englishOption = page.getByRole('link', { name: /english/i });
    if (await englishOption.isVisible()) {
      // Get the current URL to check if there's a translation
      const currentUrl = page.url();

      await englishOption.click();
      await page.waitForLoadState('networkidle');

      // Check if we're on a different URL (translation exists)
      const newUrl = page.url();
      if (currentUrl !== newUrl) {
        // If translation exists, check that we're on the English version
        await expect(page).toHaveURL(/\/en\//);
      }
    } else {
      // If English is already selected, find and click the German option
      const germanOption = page.getByRole('link', { name: /deutsch/i });
      if (await germanOption.isVisible()) {
        // Get the current URL to check if there's a translation
        const currentUrl = page.url();

        await germanOption.click();
        await page.waitForLoadState('networkidle');

        // Check if we're on a different URL (translation exists)
        const newUrl = page.url();
        if (currentUrl !== newUrl) {
          // If translation exists, check that we're on the German version
          await expect(page).toHaveURL(/\/de\/|^\//);
        }
      }
    }
  });
});
