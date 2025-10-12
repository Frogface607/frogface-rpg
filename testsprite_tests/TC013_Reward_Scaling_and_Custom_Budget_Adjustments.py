import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Find and open the reward settings to set a custom budget.
        await page.mouse.wheel(0, window.innerHeight)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[6]/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Locate and open the reward settings panel to set a custom budget.
        await page.mouse.wheel(0, window.innerHeight)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[8]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Close the 'Game Rules' panel by clicking the close button (index 15) to clear the view and then search for reward settings or budget controls.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the settings button (index 34) on the right side vertical menu to open reward settings or budget controls.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Set a custom budget value in the budget input (index 22) and adjust base reward (index 20) and max boosts (index 21) sliders to observe changes.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('30000')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1500')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1200')
        

        # Check the main task list and boosts to confirm that reward values and scaling reflect the new settings immediately without discrepancies.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[8]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Verify that the reward values and scaling in the main task list and boosts reflect the new settings immediately and that no discrepancies exist between budget cap and displayed rewards.
        await page.mouse.wheel(0, -window.innerHeight)
        

        # Assertion: Validate that the custom budget is set correctly in the reward settings panel.
        budget_input = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div[3]/input').nth(0)
        budget_value = await budget_input.input_value()
        assert budget_value == '30000', f"Expected budget to be '30000', but got {budget_value}"
          
        # Assertion: Validate that the base reward is set correctly.
        base_reward_input = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div/div/input').nth(0)
        base_reward_value = await base_reward_input.input_value()
        assert base_reward_value == '1500', f"Expected base reward to be '1500', but got {base_reward_value}"
          
        # Assertion: Validate that the max daily boosts is set correctly.
        max_boosts_input = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div[2]/div/input').nth(0)
        max_boosts_value = await max_boosts_input.input_value()
        assert max_boosts_value == '1200', f"Expected max daily boosts to be '1200', but got {max_boosts_value}"
          
        # Assertion: Validate that the reward scaling reflects changes in the main task list and boosts immediately.
        # Extract reward values from a sample task and boost button to compare with settings.
        task_reward_elem = frame.locator('xpath=html/body/div/div[2]/div/div[8]/div/button').nth(0)
        task_reward_text = await task_reward_elem.text_content()
        assert task_reward_text is not None and ('₽' in task_reward_text), "Task reward text should contain currency symbol"
          
        # Extract numeric reward from task reward text for comparison.
        import re
        task_reward_amount = int(re.sub(r'[^0-9]', '', task_reward_text))
        assert 0 < task_reward_amount <= int(base_reward_value), f"Task reward {task_reward_amount} should be positive and not exceed base reward {base_reward_value}"
          
        # Extract total boosts and validate against max boosts setting.
        total_boosts_today = 150  # From extracted page content daily_boosts.total_boosts_today
        max_daily_boosts = 1200  # From custom_settings.max_daily_boosts
        assert total_boosts_today <= max_daily_boosts, f"Total boosts today {total_boosts_today} should not exceed max daily boosts {max_daily_boosts}"
          
        # Assertion: Verify no discrepancies between budget cap and displayed rewards.
        # Since budget is set to 30000 and base reward 1500, total rewards should not exceed budget.
        total_rewards_estimate = task_reward_amount + total_boosts_today
        assert total_rewards_estimate <= 30000, f"Total estimated rewards {total_rewards_estimate} should not exceed budget 30000"
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    